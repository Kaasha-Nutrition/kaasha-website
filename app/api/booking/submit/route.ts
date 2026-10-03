import { NextRequest, NextResponse } from "next/server";
import { formatPaiseAsRupees, getMinimumBookingFeePaise } from "@/lib/booking-fees";
import { formatDateLabel, formatTimeLabel } from "@/lib/booking-format";
import { getBookingSettings } from "@/lib/booking-settings";
import { acquireSlotHold, createPendingBooking, generateBookingId, isSlotHeld } from "@/lib/booking-store";
import { isEmailConfigured, sendCustomerRequestReceivedEmail, sendOwnerPendingVerificationEmail } from "@/lib/email";
import { getBusyIntervals, isGoogleConnected, isGoogleOAuthConfigured, isNotConnectedError } from "@/lib/google-calendar";
import { isKvConfigured } from "@/lib/kv";
import { generateSlotsForDate, zonedTimeToUtc } from "@/lib/slots";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// How long a submitted-but-not-yet-verified booking holds its exact slot
// against other customers. There's no payment gateway here, so this is a
// courtesy window for Vallari to check her GPay and confirm from /admin —
// not an airtight guarantee. If she takes longer than this, the slot can
// become bookable by someone else again; the final freebusy re-check at
// confirm time (lib/booking-finalize.ts) always catches a genuine conflict.
const HOLD_TTL_SECONDS = 60 * 60 * 3; // 3 hours
const MAX_SCREENSHOT_BASE64_CHARS = 6_000_000; // ~4.5MB raw, comfortably under typical serverless body limits

interface SubmitRequestBody {
  name?: string;
  mobile?: string;
  email?: string;
  packageName?: string;
  date?: string;
  time?: string;
  message?: string;
  screenshotBase64?: string;
  screenshotFilename?: string;
  screenshotMimeType?: string;
}

function validationError(field: string, message: string) {
  return NextResponse.json({ error: "invalid_input", field, message }, { status: 400 });
}

const SLOT_TAKEN_MESSAGE = "Sorry, this time slot is no longer available. Please choose another available time.";

/**
 * PUBLIC endpoint — the entire live booking flow happens in this one step
 * (no payment gateway redirect/return). Validates the request, holds the
 * slot for a few hours, records the booking as "pending_verification", and
 * emails Vallari (with the customer's self-reported GPay payment and
 * optional screenshot) so she can confirm it from /admin once she's
 * checked her own GPay activity. No calendar event is created yet — that
 * only happens once she confirms (see /api/admin/bookings/confirm).
 */
export async function POST(req: NextRequest) {
  if (!isKvConfigured() || !isGoogleOAuthConfigured()) {
    return NextResponse.json(
      { error: "booking_unavailable", message: "Online booking isn't set up yet — please reach out via WhatsApp or email instead." },
      { status: 503 }
    );
  }

  let body: SubmitRequestBody;
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
  const screenshotBase64 = (body.screenshotBase64 || "").trim();
  const screenshotFilename = (body.screenshotFilename || "payment-screenshot.jpg").trim();
  const screenshotMimeType = (body.screenshotMimeType || "image/jpeg").trim();

  if (!name) return validationError("name", "Please enter your full name.");
  if (!mobile) return validationError("mobile", "Please enter your mobile number.");
  if (!email || !EMAIL_RE.test(email)) return validationError("email", "Please enter a valid email address.");
  if (!packageName) return validationError("packageName", "Please select a package.");
  if (!date || !DATE_RE.test(date)) return validationError("date", "Please select a valid date.");
  if (!time || !TIME_RE.test(time)) return validationError("time", "Please select a valid time.");
  if (screenshotBase64 && screenshotBase64.length > MAX_SCREENSHOT_BASE64_CHARS) {
    return validationError("screenshot", "That screenshot is too large — please attach one under ~4MB.");
  }

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
  const dateLabel = formatDateLabel(date, settings.timezone);
  const timeLabel = formatTimeLabel(time, settings.timezone);

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
      amountPaise,
      screenshotProvided: Boolean(screenshotBase64)
    });

    let ownerEmailSent = false;
    let customerEmailSent = false;
    if (isEmailConfigured()) {
      try {
        await sendOwnerPendingVerificationEmail({
          bookingId,
          customerName: name,
          customerEmail: email,
          customerMobile: mobile,
          packageName,
          dateLabel,
          timeLabel,
          message,
          amountLabel: formatPaiseAsRupees(amountPaise),
          screenshot: screenshotBase64 ? { base64: screenshotBase64, filename: screenshotFilename, mimeType: screenshotMimeType } : undefined
        });
        ownerEmailSent = true;
      } catch {
        ownerEmailSent = false;
      }
      try {
        await sendCustomerRequestReceivedEmail({
          customerName: name,
          customerEmail: email,
          customerMobile: mobile,
          packageName,
          dateLabel,
          timeLabel,
          message,
          amountLabel: formatPaiseAsRupees(amountPaise)
        });
        customerEmailSent = true;
      } catch {
        customerEmailSent = false;
      }
    }

    return NextResponse.json({
      success: true,
      bookingId,
      amountPaise,
      dateLabel,
      timeLabel,
      ownerEmailSent,
      customerEmailSent
    });
  } catch (err) {
    const { releaseSlotHold } = await import("@/lib/booking-store");
    await releaseSlotHold(date, time);
    const detail = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "submit_failed", message: "We couldn't submit your booking request. Please try again or reach out via WhatsApp.", detail }, { status: 502 });
  }
}
