/**
 * Vallari's GPay/UPI payment details for the booking deposit. This is a
 * STATIC QR code and UPI ID — not a payment gateway. There's no automated
 * bank-side verification: customers pay on their own phone, then
 * self-report and optionally upload a screenshot as proof, and Vallari
 * manually confirms the booking from /admin once she's checked her own
 * GPay activity for the matching payment.
 *
 * These are real, owner-supplied values — never edit them without
 * confirming the replacement with Vallari first. A wrong UPI ID here would
 * send real customers' money to the wrong account.
 */

export const GPAY_UPI_ID = "beautyspa11-2@okhdfcbank";
export const GPAY_ACCOUNT_NAME = "Vallari Shah";
/** Served from /public — the actual GPay QR code image Vallari supplied. */
export const GPAY_QR_IMAGE_SRC = "/images/gpay-qr.jpg";
