/**
 * Pure timezone-aware slot generation. Given the owner's availability
 * settings, a calendar date, Google's busy intervals for that day, and any
 * times currently held by an in-progress booking, produces the list of
 * bookable appointment slots. No I/O here — this is deliberately a pure
 * function so it's easy to reason about and test.
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

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Generate the bookable slots for one calendar date. `now` is injected for
 * testability and defaults to the real current time.
 */
export function generateSlotsForDate(
  dateStr: string,
  settings: BookingSettings,
  busy: BusyInterval[],
  heldTimes: string[] = [],
  now: Date = new Date()
): Slot[] {
  const dow = calendarDayOfWeek(dateStr);
  if (!settings.workingDays.includes(dow)) return [];

  const maxWindowEnd = new Date(now.getTime() + settings.maxWindowDays * 24 * 60 * 60 * 1000);
  const minNoticeThreshold = new Date(now.getTime() + settings.minNoticeHours * 60 * 60 * 1000);

  const busyDates = busy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));

  const step = settings.slotMinutes + settings.bufferMinutes;
  const endMinutes = timeToMinutes(settings.endTime);

  const slots: Slot[] = [];
  let cursor = settings.startTime;

  while (timeToMinutes(cursor) + settings.slotMinutes <= endMinutes) {
    const slotStart = zonedTimeToUtc(dateStr, cursor, settings.timezone);
    const slotEnd = new Date(slotStart.getTime() + settings.slotMinutes * 60 * 1000);

    const withinWindow = slotStart >= minNoticeThreshold && slotStart <= maxWindowEnd;
    const isHeld = heldTimes.includes(cursor);
    const isBusy = busyDates.some((b) => overlaps(slotStart, slotEnd, b.start, b.end));

    if (withinWindow && !isHeld && !isBusy) {
      slots.push({ time: cursor, startISO: slotStart.toISOString(), endISO: slotEnd.toISOString() });
    }

    cursor = addMinutes(cursor, step);
  }

  return slots;
}
