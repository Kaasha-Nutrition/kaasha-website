/**
 * Vallari's configurable appointment-availability settings — a short,
 * explicit list of weekly appointment slots (e.g. "Tuesday 5:00 PM",
 * "Thursday 11:00 AM", "Saturday 4:00 PM"), plus appointment duration and
 * booking-window rules. Stored in Vercel KV so she can change them from
 * /admin at any time without a redeploy. All times are interpreted in
 * `timezone` (fixed to Asia/Kolkata for this practice) and stored as local
 * HH:mm strings, never UTC.
 *
 * Deliberately NOT a dense auto-generated grid: Vallari offers a small,
 * fixed number of appointment times per week, not back-to-back slots
 * across a working day. A date's actual bookable times are this weekly
 * list intersected with what's genuinely free on her Google Calendar
 * (see lib/slots.ts) — so a listed slot silently disappears if she's
 * already busy at that time that particular week.
 */

import { isKvConfigured, kvGetJSON, kvSetJSON } from "./kv";

/** One recurring weekly appointment slot. `day`: 0 = Sunday … 6 = Saturday. `time`: local "HH:mm" (24h). */
export interface WeeklySlot {
  day: number;
  time: string;
}

export interface BookingSettings {
  /** IANA timezone the practice operates in. Always Asia/Kolkata for Kaasha. */
  timezone: string;
  /** The explicit list of weekly appointment slots Vallari offers. Owner-edited from /admin. */
  weeklySlots: WeeklySlot[];
  /** Length of one appointment, in minutes — used to compute each slot's end time and to block calendar overlap. */
  appointmentMinutes: number;
  /** Minimum notice required before a booking, in hours. */
  minNoticeHours: number;
  /** How many days ahead customers can book. */
  maxWindowDays: number;
}

export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  timezone: "Asia/Kolkata",
  // A starter example list — Vallari edits this from /admin to match her
  // real availability before the booking system goes live.
  weeklySlots: [
    { day: 2, time: "17:00" }, // Tuesday, 5:00 PM
    { day: 4, time: "11:00" }, // Thursday, 11:00 AM
    { day: 6, time: "16:00" } // Saturday, 4:00 PM
  ],
  appointmentMinutes: 45,
  minNoticeHours: 12,
  maxWindowDays: 30
};

const SETTINGS_KEY = "kaasha:booking-settings";

/** Read the current booking settings from KV, falling back to defaults. */
export async function getBookingSettings(): Promise<BookingSettings> {
  if (!isKvConfigured()) return DEFAULT_BOOKING_SETTINGS;
  const stored = await kvGetJSON<Partial<BookingSettings>>(SETTINGS_KEY);
  if (!stored) return DEFAULT_BOOKING_SETTINGS;
  return { ...DEFAULT_BOOKING_SETTINGS, ...stored };
}

/** Persist updated booking settings to KV (used by the /admin settings form). */
export async function saveBookingSettings(settings: BookingSettings): Promise<void> {
  await kvSetJSON(SETTINGS_KEY, settings);
}
