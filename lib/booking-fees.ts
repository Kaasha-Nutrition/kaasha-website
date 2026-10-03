/**
 * Central, non-hardcoded configuration for the booking fee customers pay
 * to request an appointment. This is deliberately separate from
 * `lib/data.ts`'s `SERVICES` array (which holds each package's *full*
 * consultation price) — the booking fee is a much smaller amount paid up
 * front via GPay/UPI to request the slot, not the price of the service
 * itself.
 *
 * Confirmed with the owner: ₹500 is a MINIMUM required amount to book —
 * every package charges at least this much. The current booking flow
 * charges exactly this minimum (the simplest, safest default); raising it
 * — globally or for one specific package — is a one-line edit here, no
 * code elsewhere needs to change.
 */

/** ₹500, in paise — the smallest currency unit, used throughout this codebase's booking-amount math. */
export const DEFAULT_MINIMUM_BOOKING_FEE_PAISE = 50000;

/**
 * Only listed here if a package's minimum booking fee should differ from
 * the default above.
 */
export const PACKAGE_MINIMUM_BOOKING_FEE_OVERRIDES: Record<string, number> = {
  // "Some Future Package": 100000, // ₹1,000 example — empty for now
};

/** The minimum amount (in paise) required to book the given package. */
export function getMinimumBookingFeePaise(packageName: string): number {
  return PACKAGE_MINIMUM_BOOKING_FEE_OVERRIDES[packageName] ?? DEFAULT_MINIMUM_BOOKING_FEE_PAISE;
}

/** ₹ display helper, e.g. 50000 -> "₹500". */
export function formatPaiseAsRupees(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}
