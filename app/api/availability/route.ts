import { NextRequest, NextResponse } from "next/server";
import { getBookingSettings } from "@/lib/booking-settings";
import { getBusyIntervals, isGoogleConnected, isGoogleOAuthConfigured, isNotConnectedError } from "@/lib/google-calendar";
import { isKvConfigured } from "@/lib/kv";
import { generateSlotsForDate, zonedTimeToUtc } from "@/lib/slots";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * PUBLIC endpoint — used by every visitor's booking widget. Returns only
 * which time-of-day slots are free or taken for one date. It never returns
 * event titles, attendees, descriptions, or any other detail from Vallari's
 * calendar — just a list of "HH:mm" strings that are currently bookable.
 */
export async function GET(req: NextRequest) {
  const date = new URL(req.url).searchParams.get("date");
  if (!date || !DATE_RE.test(date)) {
    return NextResponse.json({ error: "invalid_date", message: "Pass a date as ?date=YYYY-MM-DD." }, { status: 400 });
  }

  // Graceful degradation: if the backend isn't fully set up yet, tell the
  // frontend to show its "book via WhatsApp/email instead" fallback rather
  // than a broken page or a 500.
  if (!isKvConfigured() || !isGoogleOAuthConfigured()) {
    return NextResponse.json({ available: false, reason: "not_configured", slots: [] });
  }
  if (!(await isGoogleConnected())) {
    return NextResponse.json({ available: false, reason: "not_connected", slots: [] });
  }

  const settings = await getBookingSettings();

  try {
    const dayStartISO = zonedTimeToUtc(date, "00:00", settings.timezone).toISOString();
    const dayEndISO = zonedTimeToUtc(date, "23:59", settings.timezone).toISOString();
    const busy = await getBusyIntervals(dayStartISO, dayEndISO, settings.timezone);
    const slots = generateSlotsForDate(date, settings, busy);

    return NextResponse.json({
      available: true,
      timezone: settings.timezone,
      slots: slots.map((s) => s.time)
    });
  } catch (err) {
    if (isNotConnectedError(err)) {
      return NextResponse.json({ available: false, reason: "not_connected", slots: [] });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ available: false, reason: "calendar_error", message, slots: [] }, { status: 502 });
  }
}
