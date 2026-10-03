import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { confirmBooking } from "@/lib/booking-finalize";

export const dynamic = "force-dynamic";

/** Admin-only — call once Vallari has checked her GPay app and seen the matching payment. Creates the calendar event and sends confirmation emails. */
export async function POST(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { bookingId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const bookingId = (body.bookingId || "").trim();
  if (!bookingId) return NextResponse.json({ error: "invalid_request", message: "Missing bookingId." }, { status: 400 });

  const outcome = await confirmBooking(bookingId);
  switch (outcome.status) {
    case "not_found":
      return NextResponse.json({ status: "not_found", message: "Booking not found." }, { status: 404 });
    case "already_resolved":
      return NextResponse.json({ status: "already_resolved", booking: outcome.booking });
    case "slot_unavailable":
      return NextResponse.json({
        status: "slot_unavailable",
        message: "This exact time is no longer free on the calendar — please contact the customer to reschedule.",
        booking: outcome.booking
      });
    case "confirmed":
      return NextResponse.json({ status: "confirmed", booking: outcome.booking });
    case "error":
    default:
      return NextResponse.json({ status: "error", message: outcome.status === "error" ? outcome.message : "Something went wrong." }, { status: 502 });
  }
}
