import { NextRequest, NextResponse } from "next/server";
import { formatDateLabel, formatTimeLabel } from "@/lib/booking-format";
import { finalizeBooking } from "@/lib/booking-finalize";
import { isKvConfigured } from "@/lib/kv";
import { isPaymentsConfigured } from "@/lib/payments";

export const dynamic = "force-dynamic";

/**
 * PUBLIC endpoint — step 2 of the paid booking flow, called by the
 * /booking/return page once PhonePe redirects the customer's browser back
 * to it. This never trusts anything the browser claims about payment
 * success; it hands off to the same finalizeBooking() routine the PhonePe
 * webhook also calls, which independently re-verifies payment with
 * PhonePe's Order Status API before anything is created or confirmed.
 */
export async function POST(req: NextRequest) {
  if (!isKvConfigured() || !isPaymentsConfigured()) {
    return NextResponse.json({ status: "error", message: "Online booking isn't set up yet — please reach out via WhatsApp or email instead." }, { status: 503 });
  }

  let body: { bookingId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const bookingId = (body.bookingId || "").trim();
  if (!bookingId) {
    return NextResponse.json({ error: "invalid_request", message: "Missing bookingId." }, { status: 400 });
  }

  let outcome;
  try {
    outcome = await finalizeBooking(bookingId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ status: "error", message: "We couldn't confirm your booking right now. Please try again in a moment or reach out via WhatsApp.", detail: message }, { status: 502 });
  }

  switch (outcome.status) {
    case "not_found":
      return NextResponse.json({ status: "not_found", message: "We couldn't find that booking." }, { status: 404 });

    case "pending":
      return NextResponse.json({ status: "pending", message: "Payment is still processing. Please wait a moment." });

    case "processing":
      return NextResponse.json({ status: "processing", message: "Confirming your booking — please wait a moment." });

    case "payment_failed":
      return NextResponse.json({ status: "payment_failed", message: "Payment wasn't successful. You haven't been charged — please try again or reach out via WhatsApp." });

    case "payment_captured_slot_lost":
      return NextResponse.json({
        status: "payment_captured_slot_lost",
        message:
          "Your payment went through, but this exact time was just taken. We're reaching out to confirm your closest available slot — you'll hear from us on WhatsApp shortly. If you'd rather not wait, message us directly and we'll sort it out right away."
      });

    case "confirmed": {
      const b = outcome.booking;
      return NextResponse.json({
        status: "confirmed",
        booking: {
          name: b.name,
          email: b.email,
          mobile: b.mobile,
          packageName: b.packageName,
          date: b.date,
          time: b.time,
          dateLabel: formatDateLabel(b.date, b.timezone),
          timeLabel: formatTimeLabel(b.time, b.timezone),
          timezone: b.timezone,
          startISO: b.startISO,
          endISO: b.endISO,
          eventLink: b.eventLink,
          amountPaise: b.amountPaise,
          emailSent: Boolean(b.emailSent)
        }
      });
    }

    case "error":
    default:
      return NextResponse.json({ status: "error", message: "We couldn't confirm your booking right now. Please try again in a moment or reach out via WhatsApp." }, { status: 502 });
  }
}
