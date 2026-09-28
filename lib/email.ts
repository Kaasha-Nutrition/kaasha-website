/**
 * Transactional email via the Resend REST API (plain `fetch`, no `resend`
 * package). Sends the customer's booking confirmation and Vallari's
 * new-booking notification. Email is best-effort: a failure here is logged
 * and surfaced to the customer as a note, but it never blocks or reverses
 * an already-created calendar event — the calendar is the source of truth
 * for the appointment.
 *
 * Configure RESEND_API_KEY and RESEND_FROM_EMAIL in the Vercel dashboard.
 */

const RESEND_API = "https://api.resend.com/emails";
const OWNER_EMAIL = "vallari@kaasha.in";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export interface BookingEmailDetails {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  packageName: string;
  dateLabel: string; // e.g. "Tuesday, 14 October 2026"
  timeLabel: string; // e.g. "10:00 AM IST"
  message: string;
  /** e.g. "₹500" — the booking fee actually paid, shown once payments are wired up. */
  amountLabel?: string;
  /** e.g. "₹4,000" — the rest of the package price, collected directly by Vallari at the consultation, not through the website. Omitted when the booking fee already covers the full package price. */
  balanceLabel?: string;
}

async function sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Resend is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL missing).");

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to, subject, html, text })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Resend email failed (${res.status}): ${errText}`);
  }
}

export async function sendCustomerConfirmationEmail(d: BookingEmailDetails): Promise<void> {
  const subject = `Your Kaasha appointment is confirmed — ${d.dateLabel}`;
  const text = [
    `Hi ${d.customerName},`,
    ``,
    `Your appointment with Kaasha by Vallari Shah is confirmed.`,
    ``,
    `Package: ${d.packageName}`,
    `Date: ${d.dateLabel}`,
    `Time: ${d.timeLabel}`,
    ...(d.amountLabel ? [`Booking fee paid: ${d.amountLabel}`] : []),
    ...(d.balanceLabel ? [`Balance due at your consultation: ${d.balanceLabel} (payable directly to Vallari, not through the website)`] : []),
    ``,
    `If you need to reschedule or have questions, reply to this email or WhatsApp us at +91 77690 90258.`,
    ``,
    `— Kaasha by Vallari Shah`
  ].join("\n");
  const html = `
    <div style="font-family:Georgia,serif;color:#1E1A16;line-height:1.6;">
      <p>Hi ${escapeHtml(d.customerName)},</p>
      <p>Your appointment with <strong>Kaasha by Vallari Shah</strong> is confirmed.</p>
      <table style="margin:16px 0;">
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Package</td><td><strong>${escapeHtml(d.packageName)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Date</td><td>${escapeHtml(d.dateLabel)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Time</td><td>${escapeHtml(d.timeLabel)}</td></tr>
        ${d.amountLabel ? `<tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Booking fee paid</td><td>${escapeHtml(d.amountLabel)}</td></tr>` : ""}
        ${d.balanceLabel ? `<tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Balance due at consultation</td><td>${escapeHtml(d.balanceLabel)}</td></tr>` : ""}
      </table>
      ${d.balanceLabel ? `<p>The remaining ${escapeHtml(d.balanceLabel)} is payable directly to Vallari after your session — not through the website.</p>` : ""}
      <p>If you need to reschedule or have questions, reply to this email or WhatsApp us at <a href="https://wa.me/917769090258">+91 77690 90258</a>.</p>
      <p>— Kaasha by Vallari Shah</p>
    </div>`;
  await sendEmail(d.customerEmail, subject, html, text);
}

export async function sendOwnerNotificationEmail(d: BookingEmailDetails): Promise<void> {
  const subject = `New booking — ${d.packageName} — ${d.customerName}`;
  const text = [
    `New appointment booked via the website.`,
    ``,
    `Name: ${d.customerName}`,
    `Email: ${d.customerEmail}`,
    `Mobile: ${d.customerMobile}`,
    `Package: ${d.packageName}`,
    `Date: ${d.dateLabel}`,
    `Time: ${d.timeLabel}`,
    ...(d.amountLabel ? [`Booking fee paid: ${d.amountLabel}`] : []),
    ...(d.balanceLabel ? [`Balance to collect at consultation: ${d.balanceLabel}`] : []),
    `Goal/Message: ${d.message || "—"}`
  ].join("\n");
  const html = `
    <div style="font-family:Georgia,serif;color:#1E1A16;line-height:1.6;">
      <p><strong>New appointment booked via the website.</strong></p>
      <table>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Name</td><td>${escapeHtml(d.customerName)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Email</td><td>${escapeHtml(d.customerEmail)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Mobile</td><td>${escapeHtml(d.customerMobile)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Package</td><td>${escapeHtml(d.packageName)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Date</td><td>${escapeHtml(d.dateLabel)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Time</td><td>${escapeHtml(d.timeLabel)}</td></tr>
        ${d.amountLabel ? `<tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Booking fee paid</td><td>${escapeHtml(d.amountLabel)}</td></tr>` : ""}
        ${d.balanceLabel ? `<tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Balance to collect at consultation</td><td>${escapeHtml(d.balanceLabel)}</td></tr>` : ""}
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Goal/Message</td><td>${escapeHtml(d.message || "—")}</td></tr>
      </table>
    </div>`;
  await sendEmail(OWNER_EMAIL, subject, html, text);
}

/** Owner alert for the rare "payment captured but the slot was lost before the calendar event could be created" edge case — refund is handled manually, from the PhonePe dashboard (confirmed decision, see the architecture doc). */
export async function sendOwnerSlotLostAlertEmail(d: BookingEmailDetails & { bookingId: string }): Promise<void> {
  const subject = `ACTION NEEDED — payment captured but slot lost — ${d.customerName}`;
  const text = [
    `A customer's payment was captured, but their exact slot was booked by someone else (or you) between payment and calendar confirmation.`,
    ``,
    `Booking ID: ${d.bookingId}`,
    `Name: ${d.customerName}`,
    `Email: ${d.customerEmail}`,
    `Mobile: ${d.customerMobile}`,
    `Package: ${d.packageName}`,
    `Requested date: ${d.dateLabel}`,
    `Requested time: ${d.timeLabel}`,
    ...(d.amountLabel ? [`Amount paid: ${d.amountLabel}`] : []),
    ``,
    `Please contact the customer to offer an alternative time, and issue a refund from the PhonePe dashboard if a new time can't be arranged.`
  ].join("\n");
  const html = `<div style="font-family:Georgia,serif;color:#1E1A16;line-height:1.6;"><p><strong>ACTION NEEDED:</strong> a customer's payment was captured, but their exact slot was taken before the calendar event could be created.</p><pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(text)}</pre></div>`;
  await sendEmail(OWNER_EMAIL, subject, html, text);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
