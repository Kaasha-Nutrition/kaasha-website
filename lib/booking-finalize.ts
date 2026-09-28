/**
 * The single shared "finalize this booking" routine, called from two
 * independent triggers — the customer's browser returning from PhonePe
 * Checkout (app/api/booking/verify) and PhonePe's server-to-server webhook
 * (app/api/webhooks/payments) — whichever happens first. Both triggers
 * converge here so there is exactly one place that ever re-checks the
 * calendar and creates the event, and it's written so that being called
 * twice (or ten times, by retries) is always safe.
 *
 * This function NEVER trusts anything the caller supplies about payment
 * status — it always re-verifies with PhonePe's Order Status API itself.
 */

import { formatDateLabel, formatTimeLabel } from "./booking-format";
import {
  claimBookingFinalization,
  getBooking,
  releaseSlotHold,
  updateBooking,
  type BookingRecord
} from "./booking-store";
import { isEmailConfigured, sendCustomerConfirmationEmail, sendOwnerNotificationEmail, sendOwnerSlotLostAlertEmail } from "./email";
import { formatPaiseAsRupees } from "./booking-fees";
import { SERVICES } from "./data";
import { createCalendarEvent, getBusyIntervals, isNotConnectedError } from "./google-calendar";
import { getOrderStatus } from "./payments";

/**
 * The booking fee is a deposit, not the full package price — the rest is
 * collected by Vallari directly at the consultation, not through the
 * website. This surfaces that remaining amount for the confirmation email
 * and UI, so customers aren't confused about paying only ₹500 of a
 * ₹4,500 package. Returns null if the package's full price is unknown or
 * the booking fee already covers it.
 */
function balanceDueLabel(packageName: string, amountPaisePaid: number): string | undefined {
  const pkg = SERVICES.find((s) => s.name === packageName);
  if (!pkg || pkg.price == null) return undefined;
  const balance = pkg.price - Math.round(amountPaisePaid / 100);
  return balance > 0 ? formatPaiseAsRupees(balance * 100) : undefined;
}

export type FinalizeOutcome =
  | { status: "not_found" }
  | { status: "pending"; booking: BookingRecord }
  | { status: "payment_failed"; booking: BookingRecord }
  | { status: "processing" }
  | { status: "confirmed"; booking: BookingRecord }
  | { status: "payment_captured_slot_lost"; booking: BookingRecord }
  | { status: "error"; message: string };

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export async function finalizeBooking(bookingId: string): Promise<FinalizeOutcome> {
  const booking = await getBooking(bookingId);
  if (!booking) return { status: "not_found" };

  // Already resolved by an earlier call — idempotent replay, not an error.
  if (booking.status === "confirmed") return { status: "confirmed", booking };
  if (booking.status === "payment_captured_slot_lost") return { status: "payment_captured_slot_lost", booking };
  if (booking.status === "payment_failed") return { status: "payment_failed", booking };

  // Authoritative, server-to-server check — never trust the trigger source.
  let orderStatus;
  try {
    orderStatus = await getOrderStatus(bookingId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { status: "error", message };
  }

  if (orderStatus.state === "FAILED") {
    const updated = await updateBooking(bookingId, { status: "payment_failed" });
    await releaseSlotHold(booking.date, booking.time);
    return { status: "payment_failed", booking: updated || booking };
  }

  if (orderStatus.state === "PENDING") {
    return { status: "pending", booking };
  }

  // orderStatus.state === "COMPLETED" from here on.
  const claimed = await claimBookingFinalization(bookingId);
  if (!claimed) {
    // The other trigger (webhook or browser-return) is already handling
    // this exact booking right now. Report "processing" — the caller
    // should not create anything itself.
    const latest = await getBooking(bookingId);
    if (latest?.status === "confirmed") return { status: "confirmed", booking: latest };
    if (latest?.status === "payment_captured_slot_lost") return { status: "payment_captured_slot_lost", booking: latest };
    return { status: "processing" };
  }

  // Final freebusy re-check, immediately before creating the event —
  // the last-moment authoritative check that the exact slot is still free.
  try {
    const dayStartISO = new Date(new Date(booking.startISO).setUTCHours(0, 0, 0, 0)).toISOString();
    const dayEndISO = new Date(new Date(booking.startISO).setUTCHours(23, 59, 59, 999)).toISOString();
    const busy = await getBusyIntervals(dayStartISO, dayEndISO, booking.timezone);
    const start = new Date(booking.startISO);
    const end = new Date(booking.endISO);
    const stillFree = !busy.some((b) => overlaps(start, end, new Date(b.start), new Date(b.end)));

    if (!stillFree) {
      const updated = await updateBooking(bookingId, { status: "payment_captured_slot_lost" });
      const dateLabel = formatDateLabel(booking.date, booking.timezone);
      const timeLabel = formatTimeLabel(booking.time, booking.timezone);
      if (isEmailConfigured()) {
        try {
          await sendOwnerSlotLostAlertEmail({
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
          // best-effort — never blocks reporting the real outcome to the customer
        }
      }
      return { status: "payment_captured_slot_lost", booking: updated || booking };
    }

    // Still free — create the event. `id` makes this idempotent: a retry
    // either creates it once or (409) is treated as already-created.
    const balanceLabel = balanceDueLabel(booking.packageName, booking.amountPaise);
    const event = await createCalendarEvent({
      summary: `Kaasha — ${booking.packageName} — ${booking.name}`,
      description: [
        `Customer Name: ${booking.name}`,
        `Email: ${booking.email}`,
        `Mobile: ${booking.mobile}`,
        `Package: ${booking.packageName}`,
        `Booking fee paid: ${formatPaiseAsRupees(booking.amountPaise)}`,
        ...(balanceLabel ? [`Balance to collect at consultation: ${balanceLabel}`] : []),
        `Goal/Message: ${booking.message || "—"}`
      ].join("\n"),
      startISO: booking.startISO,
      endISO: booking.endISO,
      timezone: booking.timezone,
      id: bookingId,
      attendeeEmail: booking.email
    });

    const dateLabel = formatDateLabel(booking.date, booking.timezone);
    const timeLabel = formatTimeLabel(booking.time, booking.timezone);

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
        await sendOwnerNotificationEmail(details);
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

    // The event now exists permanently — the temporary slot-hold lock is no longer needed.
    await releaseSlotHold(booking.date, booking.time);

    return { status: "confirmed", booking: updated || booking };
  } catch (err) {
    if (isNotConnectedError(err)) {
      return { status: "error", message: "Google Calendar is not connected." };
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return { status: "error", message };
  }
}
