/**
 * Pure timezone-aware slot resolution. Given the owner's explicit weekly
 * slot list, a calendar date, and Google's busy intervals for that day,
 * produces the list of genuinely bookable appointment slots for that date
 * — i.e. the subset of the weekly list that falls on this date, respects
 * the notice/window rules, and isn't already busy on the calendar. No I/O
 * here — deliberately a pure function so it's easy to reason about and test.
 */

import type { BookingSettings } from "./booking-settings";
import type { BusyInterval } from "./google-calendar";

export interface Slot {
  /** Local "HH:mm" start time, for display and for identifying the slot. */
  time: string;
  startISO: string;
  endISO: string;
}

/** Minutes that `timeZone` is ahead of UTC at the given instant (handles DST correctly per-instant). */
function timezoneOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  return (asUTC - date.getTime()) / 60000;
}

/** Convert a local "YYYY-MM-DD" + "HH:mm" wall-clock time in `timeZone` to a UTC Date. */
export function zonedTimeToUtc(dateStr: string, timeStr: string, timeZone: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));
  const offset = timezoneOffsetMinutes(guess, timeZone);
  return new Date(guess.getTime() - offset * 60000);
}

/** Day of week (0 = Sunday … 6 = Saturday) for a "YYYY-MM-DD" calendar date, independent of any timezone. */
export function calendarDayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Resolve the bookable slots for one calendar date from the owner's
 * explicit weekly list. `now` is injected for testability and defaults to
 * the real current time.
 */
export function generateSlotsForDate(
  dateStr: string,
  settings: BookingSettings,
  busy: BusyInterval[],
  now: Date = new Date()
): Slot[] {
  const dow = calendarDayOfWeek(dateStr);
  const todaysSlots = settings.weeklySlots.filter((s) => s.day === dow);
  if (todaysSlots.length === 0) return [];

  const maxWindowEnd = new Date(now.getTime() + settings.maxWindowDays * 24 * 60 * 60 * 1000);
  const minNoticeThreshold = new Date(now.getTime() + settings.minNoticeHours * 60 * 60 * 1000);
  const busyDates = busy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));

  const slots: Slot[] = [];
  for (const ws of todaysSlots) {
    const slotStart = zonedTimeToUtc(dateStr, ws.time, settings.timezone);
    const slotEnd = new Date(slotStart.getTime() + settings.appointmentMinutes * 60 * 1000);

    const withinWindow = slotStart >= minNoticeThreshold && slotStart <= maxWindowEnd;
    const isBusy = busyDates.some((b) => overlaps(slotStart, slotEnd, b.start, b.end));

    if (withinWindow && !isBusy) {
      slots.push({ time: ws.time, startISO: slotStart.toISOString(), endISO: slotEnd.toISOString() });
    }
  }

  slots.sort((a, b) => a.time.localeCompare(b.time));
  return slots;
}
