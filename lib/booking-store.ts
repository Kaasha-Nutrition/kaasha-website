/**
 * KV-backed record of every booking requested through the website. A
 * single generated `bookingId` threads the entire flow — it doubles as
 * Google Calendar's custom event ID once Vallari confirms (see
 * lib/booking-finalize.ts), which is what makes confirming idempotent: no
 * matter how many times "confirm this booking" is triggered, it can only
 * ever actually create one calendar event.
 *
 * There's no payment gateway here — customers pay Vallari's static GPay
 * QR/UPI ID directly on their own phone and self-report the payment
 * (optionally with a screenshot, emailed to Vallari but never stored
 * here). A booking starts as "pending_verification" and only becomes
 * "confirmed" once Vallari reviews it from /admin and confirms she
 * actually received the ₹500.
 */

import crypto from "node:crypto";
import { kvDel, kvGet, kvGetJSON, kvSetJSON, kvSetNX } from "./kv";

export type BookingStatus = "pending_verification" | "confirmed" | "slot_unavailable" | "declined";

export interface BookingRecord {
  bookingId: string;
  status: BookingStatus;
  name: string;
  mobile: string;
  email: string;
  packageName: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  startISO: string;
  endISO: string;
  timezone: string;
  message: string;
  amountPaise: number;
  /** Whether the customer attached a payment screenshot when submitting (the image itself is only emailed to Vallari, never stored). */
  screenshotProvided: boolean;
  createdAt: string;
  updatedAt: string;
  eventLink?: string;
  eventId?: string;
  emailSent?: boolean;
  declineReason?: string;
}

// Lowercase hex only — valid as Google Calendar's custom event ID (only
// a-v and 0-9, 5–1024 chars: hex digits 0-9a-f are a strict subset of a-v).
export function generateBookingId(): string {
  return `kb${crypto.randomBytes(12).toString("hex")}`;
}

const BOOKING_TTL_SECONDS = 60 * 60 * 24 * 30; // keep records 30 days — ample for support follow-up
const bookingKey = (id: string) => `kaasha:booking:${id}`;
const slotHoldKey = (date: string, time: string) => `kaasha:hold:${date}:${time}`;
const PENDING_INDEX_KEY = "kaasha:pending-booking-ids";

export async function createPendingBooking(
  input: Omit<BookingRecord, "status" | "createdAt" | "updatedAt">
): Promise<BookingRecord> {
  const now = new Date().toISOString();
  const record: BookingRecord = { ...input, status: "pending_verification", createdAt: now, updatedAt: now };
  await kvSetJSON(bookingKey(record.bookingId), record, BOOKING_TTL_SECONDS);
  await addToPendingIndex(record.bookingId);
  return record;
}

export async function getBooking(bookingId: string): Promise<BookingRecord | null> {
  return kvGetJSON<BookingRecord>(bookingKey(bookingId));
}

export async function updateBooking(bookingId: string, patch: Partial<BookingRecord>): Promise<BookingRecord | null> {
  const current = await getBooking(bookingId);
  if (!current) return null;
  const next: BookingRecord = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await kvSetJSON(bookingKey(bookingId), next, BOOKING_TTL_SECONDS);
  return next;
}

/**
 * Exclusive hold on one exact date+time so two customers can't both submit
 * a request for the same slot while Vallari is checking and confirming the
 * first one. There's no payment gateway to key this off, so the TTL below
 * is a courtesy window, not an airtight guarantee — see HOLD_TTL_SECONDS in
 * app/api/booking/submit/route.ts for the actual value and the trade-off.
 * The final freebusy re-check at confirm time (lib/booking-finalize.ts)
 * always catches a genuine double-booking either way.
 */
export async function acquireSlotHold(date: string, time: string, bookingId: string, ttlSeconds: number): Promise<boolean> {
  return kvSetNX(slotHoldKey(date, time), bookingId, ttlSeconds);
}

export async function releaseSlotHold(date: string, time: string): Promise<void> {
  await kvDel(slotHoldKey(date, time));
}

export async function isSlotHeld(date: string, time: string): Promise<boolean> {
  return Boolean(await kvGet(slotHoldKey(date, time)));
}

/** Simple JSON-array index of booking IDs currently awaiting Vallari's review, so /admin can list them without needing a KV SCAN. */
async function addToPendingIndex(bookingId: string): Promise<void> {
  const ids = (await kvGetJSON<string[]>(PENDING_INDEX_KEY)) || [];
  if (!ids.includes(bookingId)) {
    ids.push(bookingId);
    await kvSetJSON(PENDING_INDEX_KEY, ids);
  }
}

export async function removeFromPendingIndex(bookingId: string): Promise<void> {
  const ids = (await kvGetJSON<string[]>(PENDING_INDEX_KEY)) || [];
  const next = ids.filter((id) => id !== bookingId);
  if (next.length !== ids.length) {
    await kvSetJSON(PENDING_INDEX_KEY, next);
  }
}

/** All bookings still awaiting Vallari's confirm/decline. Self-healing against a stale index entry (e.g. a record that expired/was GC'd elsewhere). */
export async function getPendingBookings(): Promise<BookingRecord[]> {
  const ids = (await kvGetJSON<string[]>(PENDING_INDEX_KEY)) || [];
  const records = await Promise.all(ids.map((id) => getBooking(id)));
  const live = records.filter((r): r is BookingRecord => Boolean(r) && r!.status === "pending_verification");
  const liveIds = new Set(live.map((r) => r.bookingId));
  if (liveIds.size !== ids.length) {
    await kvSetJSON(PENDING_INDEX_KEY, Array.from(liveIds));
  }
  return live;
}
