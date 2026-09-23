import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { formatDateLabel, formatTimeLabel } from "@/lib/booking-format";
import { getBookingSettings } from "@/lib/booking-settings";
import { isEmailConfigured, sendCustomerConfirmationEmail, sendOwnerNotificationEmail } from "@/lib/email";
import { createCalendarEvent, getBusyIntervals, isGoogleConnected, isGoogleOAuthConfigured, isNotConnectedError } from "@/lib/google-calendar";
import { isKvConfigured, kvDel, kvSetNX } from "@/lib/kv";
import { generateSlotsForDate, zonedTimeToUtc } from "@/lib/slots";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCK_TTL_SECONDS = 120;

interface BookRequestBody {
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
 * PUBLIC endpoint. Books an appointment following exactly the sequence
 * required for double-booking protection:
 *   1. Validate input and re-derive the slot as a legitimate offered slot.
 *   2. Acquire a short-lived exclusive lock on that exact date+time (KV SETNX).
 *   3. Re-check Google Calendar's free/busy status immediately before creating
 *      the event (in case something else — another booking, or Vallari's own
 *      calendar edit — took the slot between page load and submit).
 *   4. Only then create the calendar event. A booking is only ever reported
 *      as successful once the event has actually been created.
 */
export async function POST(req: NextRequest) {
  if (!isKvConfigured() || !isGoogleOAuthConfigured()) {
    return NextResponse.json(
      { error: "booking_unavailable", message: "Online booking isn't set up yet — please reach out via WhatsApp or email instead." },
      { status: 503 }
    );
  }

  let body: BookRequestBody;
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

  // Step 1: confirm this is a legitimately offered slot right now (correct
  // day/hours, enough notice, within the booking window, not already busy).
  let dayStartISO: string, dayEndISO: string;
  try {
    dayStartISO = zonedTimeToUtc(date, "00:00", settings.timezone).toISOString();
    dayEndISO = zonedTimeToUtc(date, "23:59", settings.timezone).toISOString();
  } catch {
    return validationError("date", "Please select a valid date.");
  }

  let busyBeforeLock;
  try {
    busyBeforeLock = await getBusyIntervals(dayStartISO, dayEndISO, settings.timezone);
  } catch (err) {
    if (isNotConnectedError(err)) {
      return NextResponse.json({ error: "booking_unavailable", message: "Online booking isn't set up yet — please reach out via WhatsApp or email instead." }, { status: 503 });
    }
    return NextResponse.json({ error: "calendar_unavailable", message: "We couldn't reach the calendar right now. Please try again in a moment or reach out via WhatsApp." }, { status: 502 });
  }

  const offeredSlots = generateSlotsForDate(date, settings, busyBeforeLock);
  const chosen = offeredSlots.find((s) => s.time === time);
  if (!chosen) {
    return NextResponse.json({ error: "slot_taken", message: SLOT_TAKEN_MESSAGE }, { status: 409 });
  }

  // Step 2: acquire an exclusive short-lived lock on this exact slot so two
  // simultaneous requests can't both proceed to create an event.
  const lockKey = `hold:${date}:${time}`;
  const lockToken = crypto.randomUUID();
  const acquired = await kvSetNX(lockKey, lockToken, LOCK_TTL_SECONDS);
  if (!acquired) {
    return NextResponse.json({ error: "slot_taken", message: SLOT_TAKEN_MESSAGE }, { status: 409 });
  }

  try {
    // Step 3: re-check Google's free/busy status immediately before creating
    // the event — the authoritative, last-moment check.
    const busyRightBeforeCreate = await getBusyIntervals(dayStartISO, dayEndISO, settings.timezone);
    const stillFree = generateSlotsForDate(date, settings, busyRightBeforeCreate).some((s) => s.time === time);
    if (!stillFree) {
      await kvDel(lockKey);
      return NextResponse.json({ error: "slot_taken", message: SLOT_TAKEN_MESSAGE }, { status: 409 });
    }

    // Step 4: create the event. Only now is the booking considered real.
    const description = [
      `Customer Name: ${name}`,
      `Email: ${email}`,
      `Mobile: ${mobile}`,
      `Package: ${packageName}`,
      `Goal/Message: ${message || "—"}`
    ].join("\n");

    let event;
    try {
      event = await createCalendarEvent({
        summary: `Kaasha — ${packageName} — ${name}`,
        description,
        startISO: chosen.startISO,
        endISO: chosen.endISO,
        timezone: settings.timezone
      });
    } catch (err) {
      await kvDel(lockKey);
      const msg = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: "calendar_error", message: "We couldn't create the calendar event. Please try again or reach out via WhatsApp.", detail: msg },
        { status: 502 }
      );
    }

    const dateLabel = formatDateLabel(date, settings.timezone);
    const timeLabel = formatTimeLabel(time, settings.timezone);

    // Email is best-effort — never reverses or blocks the already-created booking.
    let emailSent = false;
    if (isEmailConfigured()) {
      try {
        await sendCustomerConfirmationEmail({ customerName: name, customerEmail: email, customerMobile: mobile, packageName, dateLabel, timeLabel, message });
        await sendOwnerNotificationEmail({ customerName: name, customerEmail: email, customerMobile: mobile, packageName, dateLabel, timeLabel, message });
        emailSent = true;
      } catch {
        emailSent = false;
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        name,
        email,
        mobile,
        packageName,
        date,
        time,
        dateLabel,
        timeLabel,
        timezone: settings.timezone,
        startISO: chosen.startISO,
        endISO: chosen.endISO,
        eventLink: event.htmlLink,
        emailSent
      }
    });
  } catch (err) {
    await kvDel(lockKey);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "booking_failed", message }, { status: 500 });
  }
}
