/**
 * Vallari's configurable appointment-availability settings — working days,
 * hours, slot length, buffer, and booking-window rules. Stored in Vercel KV
 * so she can change them from /admin at any time without a redeploy. All
 * times are interpreted in `timezone` (fixed to Asia/Kolkata for this
 * practice) and stored as local HH:mm strings, never UTC.
 */

import { isKvConfigured, kvGetJSON, kvSetJSON } from "./kv";

export interface BookingSettings {
  /** IANA timezone the practice operates in. Always Asia/Kolkata for Kaasha. */
  timezone: string;
  /** Days of the week appointments are offered. 0 = Sunday … 6 = Saturday. */
  workingDays: number[];
  /** Local start of the working day, "HH:mm" (24h). */
  startTime: string;
  /** Local end of the working day, "HH:mm" (24h). */
  endTime: string;
  /** Length of one appointment slot, in minutes. */
  slotMinutes: number;
  /** Gap kept free between consecutive appointments, in minutes. */
  bufferMinutes: number;
  /** Minimum notice required before a booking, in hours. */
  minNoticeHours: number;
  /** How many days ahead customers can book. */
  maxWindowDays: number;
}

export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  timezone: "Asia/Kolkata",
  workingDays: [1, 2, 3, 4, 5, 6], // Mon–Sat; Vallari can change this in /admin
  startTime: "10:00",
  endTime: "18:00",
  slotMinutes: 45,
  bufferMinutes: 15,
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
