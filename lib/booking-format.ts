/**
 * Shared date/time display formatting for the booking flow, so the API
 * responses and the UI agree on how a slot is labeled to the customer.
 */

/** e.g. "Tuesday, 14 October 2026" for a "YYYY-MM-DD" date in the given timezone. */
export function formatDateLabel(dateStr: string, timezone: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  // Noon UTC avoids any date-boundary drift when formatting in a different timezone.
  const noon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(noon);
}

/** e.g. "10:00 AM IST" for a "HH:mm" local time. */
export function formatTimeLabel(timeStr: string, timezone: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const tzLabel = timezone === "Asia/Kolkata" ? "IST" : timezone;
  return `${h12}:${m.toString().padStart(2, "0")} ${period} ${tzLabel}`;
}
