import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { declineBooking } from "@/lib/booking-finalize";

export const dynamic = "force-dynamic";

/** Admin-only — declines a pending booking (e.g. the ₹500 was never received) and releases its slot hold. No automated customer email is sent; Vallari contacts them directly. */
export async function POST(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { bookingId?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const bookingId = (body.bookingId || "").trim();
  if (!bookingId) return NextResponse.json({ error: "invalid_request", message: "Missing bookingId." }, { status: 400 });

  const outcome = await declineBooking(bookingId, (body.reason || "").trim());
  switch (outcome.status) {
    case "not_found":
      return NextResponse.json({ status: "not_found", message: "Booking not found." }, { status: 404 });
    case "already_resolved":
      return NextResponse.json({ status: "already_resolved", booking: outcome.booking });
    case "declined":
      return NextResponse.json({ status: "declined", booking: outcome.booking });
    case "error":
    default:
      return NextResponse.json({ status: "error", message: outcome.status === "error" ? outcome.message : "Something went wrong." }, { status: 502 });
  }
}
