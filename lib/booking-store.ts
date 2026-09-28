/**
 * KV-backed record of every in-flight and completed paid booking. A single
 * generated `bookingId` threads the entire flow — it doubles as PhonePe's
 * `merchantOrderId` and (in lowercase-hex form, which is what makes this
 * safe) as Google Calendar's custom event ID — which is what makes retries
 * from either PhonePe's webhook or the customer's browser idempotent: no
 * matter how many times "finalize this booking" is triggered, it can only
 * ever actually create one calendar event and send one set of emails.
 */

import crypto from "node:crypto";
import { kvGetJSON, kvSetJSON, kvSetNX } from "./kv";

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "payment_failed"
  | "payment_captured_slot_lost"
  | "expired";

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
  createdAt: string;
  updatedAt: string;
  eventLink?: string;
  eventId?: string;
  emailSent?: boolean;
}

// Lowercase hex only — valid for both PhonePe's merchantOrderId (alphanumeric
// + "_"/"-", max 63 chars) and Google Calendar's custom event ID (only
// a-v and 0-9, 5–1024 chars: hex digits 0-9a-f are a strict subset of a-v).
export function generateBookingId(): string {
  return `kb${crypto.randomBytes(12).toString("hex")}`;
}

const BOOKING_TTL_SECONDS = 60 * 60 * 24 * 30; // keep records 30 days — ample for support follow-up
const bookingKey = (id: string) => `kaasha:booking:${id}`;
const finalizeClaimKey = (id: string) => `kaasha:booking-finalize-claim:${id}`;
const slotHoldKey = (date: string, time: string) => `kaasha:hold:${date}:${time}`;

export async function createPendingBooking(
  input: Omit<BookingRecord, "status" | "createdAt" | "updatedAt">
): Promise<BookingRecord> {
  const now = new Date().toISOString();
  const record: BookingRecord = { ...input, status: "pending_payment", createdAt: now, updatedAt: now };
  await kvSetJSON(bookingKey(record.bookingId), record, BOOKING_TTL_SECONDS);
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
 * Exclusive short-lived hold on one exact date+time so two customers can't
 * both proceed to payment for the same slot. Acquired at "create payment
 * order" time (not final submit) with a ~15-minute TTL — long enough to
 * realistically complete a PhonePe Checkout.
 */
export async function acquireSlotHold(date: string, time: string, bookingId: string, ttlSeconds: number): Promise<boolean> {
  return kvSetNX(slotHoldKey(date, time), bookingId, ttlSeconds);
}

export async function releaseSlotHold(date: string, time: string): Promise<void> {
  const { kvDel } = await import("./kv");
  await kvDel(slotHoldKey(date, time));
}

export async function isSlotHeld(date: string, time: string): Promise<boolean> {
  const { kvGet } = await import("./kv");
  return Boolean(await kvGet(slotHoldKey(date, time)));
}

/**
 * Atomic claim so that only ONE of (a) the customer's browser returning
 * from checkout or (b) PhonePe's webhook — whichever gets here first —
 * actually proceeds to re-check the calendar and create the event. The
 * other caller sees `false` and reports "already being finalized" rather
 * than racing to create a duplicate event or send duplicate emails.
 */
export async function claimBookingFinalization(bookingId: string): Promise<boolean> {
  return kvSetNX(finalizeClaimKey(bookingId), "1", 600);
}
