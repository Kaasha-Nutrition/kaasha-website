/**
 * Booking confirm/decline — triggered only from the password-gated
 * /admin dashboard once Vallari has checked her own GPay activity for the
 * customer's self-reported ₹500 payment. There's no payment gateway to
 * re-verify against; the only thing re-checked here is the calendar (in
 * case the exact slot got taken by something else between the request and
 * her confirming it).
 */

import { formatDateLabel, formatTimeLabel } from "./booking-format";
import { formatPaiseAsRupees } from "./booking-fees";
import { getBooking, releaseSlotHold, removeFromPendingIndex, updateBooking, type BookingRecord } from "./booking-store";
import { SERVICES } from "./data";
import {
  isEmailConfigured,
  sendCustomerConfirmationEmail,
  sendOwnerBookingConfirmedReceiptEmail,
  sendOwnerSlotUnavailableAlertEmail
} from "./email";
import { createCalendarEvent, getBusyIntervals, isNotConnectedError } from "./google-calendar";

/**
 * The booking fee is a deposit, not the full package price — the rest is
 * collected by Vallari directly at the consultation, not through the
 * website. Returns null if the package's full price is unknown or the
 * booking fee already covers it.
 */
function balanceDueLabel(packageName: string, amountPaisePaid: number): string | undefined {
  const pkg = SERVICES.find((s) => s.name === packageName);
  if (!pkg || pkg.price == null) return undefined;
  const balance = pkg.price - Math.round(amountPaisePaid / 100);
  return balance > 0 ? formatPaiseAsRupees(balance * 100) : undefined;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export type ConfirmOutcome =
  | { status: "not_found" }
  | { status: "already_resolved"; booking: BookingRecord }
  | { status: "slot_unavailable"; booking: BookingRecord }
  | { status: "confirmed"; booking: BookingRecord }
  | { status: "error"; message: string };

/** Confirm a pending booking: re-check the calendar is still free, create the event idempotently, and email both sides. */
export async function confirmBooking(bookingId: string): Promise<ConfirmOutcome> {
  const booking = await getBooking(bookingId);
  if (!booking) return { status: "not_found" };
  if (booking.status !== "pending_verification") {
    return { status: "already_resolved", booking };
  }

  try {
    const dayStartISO = new Date(new Date(booking.startISO).setUTCHours(0, 0, 0, 0)).toISOString();
    const dayEndISO = new Date(new Date(booking.startISO).setUTCHours(23, 59, 59, 999)).toISOString();
    const busy = await getBusyIntervals(dayStartISO, dayEndISO, booking.timezone);
    const start = new Date(booking.startISO);
    const end = new Date(booking.endISO);
    const stillFree = !busy.some((b) => overlaps(start, end, new Date(b.start), new Date(b.end)));

    const dateLabel = formatDateLabel(booking.date, booking.timezone);
    const timeLabel = formatTimeLabel(booking.time, booking.timezone);

    if (!stillFree) {
      const updated = await updateBooking(bookingId, { status: "slot_unavailable" });
      await releaseSlotHold(booking.date, booking.time);
      await removeFromPendingIndex(bookingId);
      if (isEmailConfigured()) {
        try {
          await sendOwnerSlotUnavailableAlertEmail({
            bookingId,
            customerName: booking.name,
            customerEmail: booking.email,
            customerMobile: booking.mobile,
            packageName: booking.packageName,
            dateLabel,
            timeLabel,
            message: booking.message,
            amountLabel: formatPaiseAsRupees(booking.amountPaise)
          });
        } catch {
          // best-effort
        }
      }
      return { status: "slot_unavailable", booking: updated || booking };
    }

    const balanceLabel = balanceDueLabel(booking.packageName, booking.amountPaise);
    const event = await createCalendarEvent({
      summary: `Kaasha — ${booking.packageName} — ${booking.name}`,
      description: [
        `Customer Name: ${booking.name}`,
        `Email: ${booking.email}`,
        `Mobile: ${booking.mobile}`,
        `Package: ${booking.packageName}`,
        `Booking fee (GPay, self-reported & confirmed by Vallari): ${formatPaiseAsRupees(booking.amountPaise)}`,
        ...(balanceLabel ? [`Balance to collect at consultation: ${balanceLabel}`] : []),
        `Goal/Message: ${booking.message || "—"}`
      ].join("\n"),
      startISO: booking.startISO,
      endISO: booking.endISO,
      timezone: booking.timezone,
      id: bookingId,
      attendeeEmail: booking.email
    });

    let emailSent = false;
    if (isEmailConfigured()) {
      try {
        const details = {
          customerName: booking.name,
          customerEmail: booking.email,
          customerMobile: booking.mobile,
          packageName: booking.packageName,
          dateLabel,
          timeLabel,
          message: booking.message,
          amountLabel: formatPaiseAsRupees(booking.amountPaise),
          balanceLabel
        };
        await sendCustomerConfirmationEmail(details);
        await sendOwnerBookingConfirmedReceiptEmail(details);
        emailSent = true;
      } catch {
        emailSent = false;
      }
    }

    const updated = await updateBooking(bookingId, {
      status: "confirmed",
      eventLink: event.htmlLink,
      eventId: event.id,
      emailSent
    });

    await releaseSlotHold(booking.date, booking.time);
    await removeFromPendingIndex(bookingId);

    return { status: "confirmed", booking: updated || booking };
  } catch (err) {
    if (isNotConnectedError(err)) {
      return { status: "error", message: "Google Calendar is not connected." };
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return { status: "error", message };
  }
}

export type DeclineOutcome =
  | { status: "not_found" }
  | { status: "already_resolved"; booking: BookingRecord }
  | { status: "declined"; booking: BookingRecord }
  | { status: "error"; message: string };

/**
 * Decline a pending booking (e.g. the ₹500 was never actually received) —
 * releases the slot hold and leaves Vallari to contact the customer
 * herself (their mobile number is shown right in /admin). No automated
 * customer email is sent here, deliberately — a decline usually needs a
 * human conversation, not a form letter.
 */
export async function declineBooking(bookingId: string, reason?: string): Promise<DeclineOutcome> {
  const booking = await getBooking(bookingId);
  if (!booking) return { status: "not_found" };
  if (booking.status !== "pending_verification") {
    return { status: "already_resolved", booking };
  }
  const updated = await updateBooking(bookingId, { status: "declined", declineReason: reason || undefined });
  await releaseSlotHold(booking.date, booking.time);
  await removeFromPendingIndex(bookingId);
  return { status: "declined", booking: updated || booking };
}
