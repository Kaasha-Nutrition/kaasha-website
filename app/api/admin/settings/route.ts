import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { DEFAULT_MINIMUM_BOOKING_FEE_PAISE, formatPaiseAsRupees } from "@/lib/booking-fees";
import { DEFAULT_BOOKING_SETTINGS, getBookingSettings, saveBookingSettings, type BookingSettings } from "@/lib/booking-settings";
import { isGoogleConnected, isGoogleOAuthConfigured } from "@/lib/google-calendar";
import { isKvConfigured } from "@/lib/kv";
import { isPaymentsConfigured } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const settings = await getBookingSettings();
  return NextResponse.json({
    settings,
    kvConfigured: isKvConfigured(),
    googleOAuthConfigured: isGoogleOAuthConfigured(),
    paymentsConfigured: isPaymentsConfigured(),
    googleConnected: await isGoogleConnected(),
    minimumBookingFeeLabel: formatPaiseAsRupees(DEFAULT_MINIMUM_BOOKING_FEE_PAISE)
  });
}

function isValidSettings(body: unknown): body is BookingSettings {
  if (!body || typeof body !== "object") return false;
  const s = body as Record<string, unknown>;
  return (
    typeof s.timezone === "string" &&
    Array.isArray(s.weeklySlots) &&
    (s.weeklySlots as unknown[]).every((w) => {
      if (!w || typeof w !== "object") return false;
      const slot = w as Record<string, unknown>;
      const day = slot.day;
      const time = slot.time;
      return typeof day === "number" && day >= 0 && day <= 6 && typeof time === "string" && /^\d{2}:\d{2}$/.test(time);
    }) &&
    typeof s.appointmentMinutes === "number" &&
    s.appointmentMinutes > 0 &&
    typeof s.minNoticeHours === "number" &&
    s.minNoticeHours >= 0 &&
    typeof s.maxWindowDays === "number" &&
    s.maxWindowDays > 0
  );
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isKvConfigured()) {
    return NextResponse.json({ error: "not_configured", message: "Vercel KV isn't connected yet." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const merged = { ...DEFAULT_BOOKING_SETTINGS, ...(body as object) };
  if (!isValidSettings(merged)) {
    return NextResponse.json({ error: "invalid_settings", message: "One or more settings values are invalid." }, { status: 400 });
  }

  await saveBookingSettings(merged);
  return NextResponse.json({ success: true, settings: merged });
}
