import { NextRequest, NextResponse } from "next/server";
import { getMinimumBookingFeePaise } from "@/lib/booking-fees";
import { formatDateLabel, formatTimeLabel } from "@/lib/booking-format";
import { getBookingSettings } from "@/lib/booking-settings";
import { acquireSlotHold, createPendingBooking, generateBookingId, isSlotHeld } from "@/lib/booking-store";
import { isEmailConfigured } from "@/lib/email";
import { getBusyIntervals, isGoogleConnected, isGoogleOAuthConfigured, isNotConnectedError } from "@/lib/google-calendar";
import { isKvConfigured } from "@/lib/kv";
import { createPaymentOrder, isPaymentsConfigured } from "@/lib/payments";
import { generateSlotsForDate, zonedTimeToUtc } from "@/lib/slots";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HOLD_TTL_SECONDS = 900; // 15 minutes — a realistic PhonePe Checkout completion window

interface StartRequestBody {
  name?: string;
  mobile?: string;
  email?: string;
  packageName?: string;
  date?: string;
  time?: string;
  message?: string;
}

function validationError(field: string, message: string) {
  return NextResponse.json({ error: "invalid_input", field, message }, { status: 400 });
}

const SLOT_TAKEN_MESSAGE = "Sorry, this time slot is no longer available. Please choose another available time.";

/**
 * PUBLIC endpoint — step 1 of the paid booking flow. Validates the request,
 * takes a short exclusive hold on the exact slot, creates a pending
 * booking record, and creates a PhonePe payment order for the required
 * booking fee. Returns the URL the browser should be redirected to for
 * checkout. No calendar event is created here — that only happens after
 * payment is verified (see /api/booking/verify and /api/webhooks/payments).
 */
export async function POST(req: NextRequest) {
  if (!isKvConfigured() || !isGoogleOAuthConfigured() || !isPaymentsConfigured()) {
    return NextResponse.json(
      { error: "booking_unavailable", message: "Online booking isn't set up yet — please reach out via WhatsApp or email instead." },
      { status: 503 }
    );
  }

  let body: StartRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const mobile = (body.mobile || "").trim();
  const email = (body.email || "").trim();
  const packageName = (body.packageName || "").trim();
  const date = (body.date || "").trim();
  const time = (body.time || "").trim();
  const message = (body.message || "").trim();

  if (!name) return validationError("name", "Please enter your full name.");
  if (!mobile) return validationError("mobile", "Please enter your mobile number.");
  if (!email || !EMAIL_RE.test(email)) return validationError("email", "Please enter a valid email address.");
  if (!packageName) return validationError("packageName", "Please select a package.");
  if (!date || !DATE_RE.test(date)) return validationError("date", "Please select a valid date.");
  if (!time || !TIME_RE.test(time)) return validationError("time", "Please select a valid time.");

  if (!(await isGoogleConnected())) {
    return NextResponse.json(
      { error: "booking_unavailable", message: "Online booking isn't set up yet — please reach out via WhatsApp or email instead." },
      { status: 503 }
    );
  }

  const settings = await getBookingSettings();

  let dayStartISO: string, dayEndISO: string;
  try {
    dayStartISO = zonedTimeToUtc(date, "00:00", settings.timezone).toISOString();
    dayEndISO = zonedTimeToUtc(date, "23:59", settings.timezone).toISOString();
  } catch {
    return validationError("date", "Please select a valid date.");
  }

  let busy;
  try {
    busy = await getBusyIntervals(dayStartISO, dayEndISO, settings.timezone);
  } catch (err) {
    if (isNotConnectedError(err)) {
      return NextResponse.json({ error: "booking_unavailable", message: "Online booking isn't set up yet — please reach out via WhatsApp or email instead." }, { status: 503 });
    }
    return NextResponse.json({ error: "calendar_unavailable", message: "We couldn't reach the calendar right now. Please try again in a moment or reach out via WhatsApp." }, { status: 502 });
  }

  const offeredSlots = generateSlotsForDate(date, settings, busy);
  const chosen = offeredSlots.find((s) => s.time === time);
  if (!chosen) {
    return NextResponse.json({ error: "slot_taken", message: SLOT_TAKEN_MESSAGE }, { status: 409 });
  }
  if (await isSlotHeld(date, time)) {
    return NextResponse.json({ error: "slot_taken", message: SLOT_TAKEN_MESSAGE }, { status: 409 });
  }

  const bookingId = generateBookingId();
  const acquired = await acquireSlotHold(date, time, bookingId, HOLD_TTL_SECONDS);
  if (!acquired) {
    return NextResponse.json({ error: "slot_taken", message: SLOT_TAKEN_MESSAGE }, { status: 409 });
  }

  const amountPaise = getMinimumBookingFeePaise(packageName);

  try {
    await createPendingBooking({
      bookingId,
      name,
      mobile,
      email,
      packageName,
      date,
      time,
      startISO: chosen.startISO,
      endISO: chosen.endISO,
      timezone: settings.timezone,
      message,
      amountPaise
    });

    const origin = new URL(req.url).origin;
    const redirectUrl = `${origin}/booking/return?bookingId=${encodeURIComponent(bookingId)}`;

    const order = await createPaymentOrder({
      merchantOrderId: bookingId,
      amountPaise,
      redirectUrl,
      expireAfterSeconds: HOLD_TTL_SECONDS
    });

    return NextResponse.json({
      success: true,
      bookingId,
      amountPaise,
      dateLabel: formatDateLabel(date, settings.timezone),
      timeLabel: formatTimeLabel(time, settings.timezone),
      checkoutUrl: order.redirectUrl,
      emailConfigured: isEmailConfigured()
    });
  } catch (err) {
    const { releaseSlotHold } = await import("@/lib/booking-store");
    await releaseSlotHold(date, time);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "payment_order_failed", message: "We couldn't start the payment. Please try again or reach out via WhatsApp.", detail: message }, { status: 502 });
  }
}
