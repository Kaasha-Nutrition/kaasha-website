import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { getPendingBookings } from "@/lib/booking-store";

export const dynamic = "force-dynamic";

/** Admin-only — lists every booking currently awaiting GPay payment verification. */
export async function GET(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const bookings = await getPendingBookings();
  bookings.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); // newest first
  return NextResponse.json({ bookings });
}
