/**
 * Transactional email via the Resend REST API (plain `fetch`, no `resend`
 * package). Email is best-effort: a failure here is logged and surfaced
 * as a note, but it never blocks or reverses a booking that's already
 * been recorded — the calendar is the source of truth for a confirmed
 * appointment, and Vallari's own GPay app is the source of truth for
 * whether a payment actually arrived.
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
  /** e.g. "₹500" — the booking fee. */
  amountLabel?: string;
  /** e.g. "₹4,000" — the rest of the package price, collected directly by Vallari at the consultation, not through the website. Omitted when the booking fee already covers the full package price. */
  balanceLabel?: string;
}

export interface EmailAttachment {
  filename: string;
  /** base64-encoded file content (no "data:...;base64," prefix). */
  content: string;
}

async function sendEmail(to: string, subject: string, html: string, text: string, attachments?: EmailAttachment[]): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Resend is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL missing).");

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to, subject, html, text, ...(attachments && attachments.length ? { attachments } : {}) })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Resend email failed (${res.status}): ${errText}`);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

/** Sent to the customer right after they submit — the booking is NOT confirmed yet at this point. */
export async function sendCustomerRequestReceivedEmail(d: BookingEmailDetails): Promise<void> {
  const subject = `We've received your booking request — ${d.packageName}`;
  const text = [
    `Hi ${d.customerName},`,
    ``,
    `Thanks — we've received your booking request with Kaasha by Vallari Shah.`,
    ``,
    `Package: ${d.packageName}`,
    `Requested date: ${d.dateLabel}`,
    `Requested time: ${d.timeLabel}`,
    ...(d.amountLabel ? [`Booking fee: ${d.amountLabel} (via GPay/UPI)`] : []),
    ``,
    `Vallari will check her GPay for your payment and confirm your appointment shortly — you'll get a separate confirmation email (with a calendar invite) once she does. This isn't your confirmation yet.`,
    ``,
    `Questions in the meantime? WhatsApp us at +91 77690 90258 or reply to this email.`,
    ``,
    `— Kaasha by Vallari Shah`
  ].join("\n");
  const html = `
    <div style="font-family:Georgia,serif;color:#1E1A16;line-height:1.6;">
      <p>Hi ${escapeHtml(d.customerName)},</p>
      <p>Thanks — we've received your booking request with <strong>Kaasha by Vallari Shah</strong>.</p>
      <table style="margin:16px 0;">
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Package</td><td><strong>${escapeHtml(d.packageName)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Requested date</td><td>${escapeHtml(d.dateLabel)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Requested time</td><td>${escapeHtml(d.timeLabel)}</td></tr>
        ${d.amountLabel ? `<tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Booking fee</td><td>${escapeHtml(d.amountLabel)} (via GPay/UPI)</td></tr>` : ""}
      </table>
      <p><strong>This isn't your confirmation yet.</strong> Vallari will check her GPay for your payment and confirm your appointment shortly — you'll get a separate confirmation email (with a calendar invite) once she does.</p>
      <p>Questions in the meantime? WhatsApp us at <a href="https://wa.me/917769090258">+91 77690 90258</a> or reply to this email.</p>
      <p>— Kaasha by Vallari Shah</p>
    </div>`;
  await sendEmail(d.customerEmail, subject, html, text);
}

/** Sent to Vallari the moment a customer submits a request — this is the email she acts on from /admin. Includes the payment screenshot as an attachment when the customer provided one. */
export async function sendOwnerPendingVerificationEmail(
  d: BookingEmailDetails & { bookingId: string; screenshot?: { base64: string; filename: string; mimeType: string } }
): Promise<void> {
  const subject = `GPay payment to verify — ${d.packageName} — ${d.customerName}`;
  const text = [
    `A customer submitted a booking request and says they've paid via GPay/UPI. Check your GPay activity for a matching payment, then confirm or decline this booking from /admin.`,
    ``,
    `Booking ID: ${d.bookingId}`,
    `Name: ${d.customerName}`,
    `Email: ${d.customerEmail}`,
    `Mobile: ${d.customerMobile}`,
    `Package: ${d.packageName}`,
    `Requested date: ${d.dateLabel}`,
    `Requested time: ${d.timeLabel}`,
    ...(d.amountLabel ? [`Amount claimed: ${d.amountLabel}`] : []),
    `Screenshot attached: ${d.screenshot ? "Yes" : "No"}`,
    `Goal/Message: ${d.message || "—"}`,
    ``,
    `Go to kaasha.in/admin to confirm or decline.`
  ].join("\n");
  const html = `
    <div style="font-family:Georgia,serif;color:#1E1A16;line-height:1.6;">
      <p><strong>Action needed:</strong> a customer submitted a booking request and says they've paid via GPay/UPI.</p>
      <p>Check your GPay activity for a matching ${d.amountLabel ? `<strong>${escapeHtml(d.amountLabel)}</strong>` : "payment"}${d.screenshot ? " (their screenshot is attached)" : " — they did not attach a screenshot"}, then confirm or decline this booking from <a href="https://kaasha.in/admin">kaasha.in/admin</a>.</p>
      <table>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Name</td><td>${escapeHtml(d.customerName)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Email</td><td>${escapeHtml(d.customerEmail)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Mobile</td><td>${escapeHtml(d.customerMobile)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Package</td><td>${escapeHtml(d.packageName)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Requested date</td><td>${escapeHtml(d.dateLabel)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Requested time</td><td>${escapeHtml(d.timeLabel)}</td></tr>
        ${d.amountLabel ? `<tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Amount claimed</td><td>${escapeHtml(d.amountLabel)}</td></tr>` : ""}
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Goal/Message</td><td>${escapeHtml(d.message || "—")}</td></tr>
      </table>
    </div>`;
  await sendEmail(
    OWNER_EMAIL,
    subject,
    html,
    text,
    d.screenshot ? [{ filename: d.screenshot.filename, content: d.screenshot.base64 }] : undefined
  );
}

/** Sent to the customer once Vallari has actually confirmed from /admin. */
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
    ...(d.amountLabel ? [`Booking fee received: ${d.amountLabel}`] : []),
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
        ${d.amountLabel ? `<tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Booking fee received</td><td>${escapeHtml(d.amountLabel)}</td></tr>` : ""}
        ${d.balanceLabel ? `<tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Balance due at consultation</td><td>${escapeHtml(d.balanceLabel)}</td></tr>` : ""}
      </table>
      ${d.balanceLabel ? `<p>The remaining ${escapeHtml(d.balanceLabel)} is payable directly to Vallari after your session — not through the website.</p>` : ""}
      <p>If you need to reschedule or have questions, reply to this email or WhatsApp us at <a href="https://wa.me/917769090258">+91 77690 90258</a>.</p>
      <p>— Kaasha by Vallari Shah</p>
    </div>`;
  await sendEmail(d.customerEmail, subject, html, text);
}

/** A short receipt to Vallari's own inbox recording that she confirmed this booking (useful as an audit trail alongside the calendar event). */
export async function sendOwnerBookingConfirmedReceiptEmail(d: BookingEmailDetails): Promise<void> {
  const subject = `Confirmed — ${d.packageName} — ${d.customerName}`;
  const text = [
    `You confirmed this appointment.`,
    ``,
    `Name: ${d.customerName}`,
    `Email: ${d.customerEmail}`,
    `Mobile: ${d.customerMobile}`,
    `Package: ${d.packageName}`,
    `Date: ${d.dateLabel}`,
    `Time: ${d.timeLabel}`,
    ...(d.amountLabel ? [`Booking fee received: ${d.amountLabel}`] : []),
    ...(d.balanceLabel ? [`Balance to collect at consultation: ${d.balanceLabel}`] : []),
    `Goal/Message: ${d.message || "—"}`
  ].join("\n");
  const html = `
    <div style="font-family:Georgia,serif;color:#1E1A16;line-height:1.6;">
      <p><strong>You confirmed this appointment.</strong></p>
      <table>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Name</td><td>${escapeHtml(d.customerName)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Email</td><td>${escapeHtml(d.customerEmail)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Mobile</td><td>${escapeHtml(d.customerMobile)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Package</td><td>${escapeHtml(d.packageName)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Date</td><td>${escapeHtml(d.dateLabel)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Time</td><td>${escapeHtml(d.timeLabel)}</td></tr>
        ${d.amountLabel ? `<tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Booking fee received</td><td>${escapeHtml(d.amountLabel)}</td></tr>` : ""}
        ${d.balanceLabel ? `<tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Balance to collect at consultation</td><td>${escapeHtml(d.balanceLabel)}</td></tr>` : ""}
        <tr><td style="padding:4px 12px 4px 0;color:#8A8175;">Goal/Message</td><td>${escapeHtml(d.message || "—")}</td></tr>
      </table>
    </div>`;
  await sendEmail(OWNER_EMAIL, subject, html, text);
}

/** Owner alert for the case where she tries to confirm a booking but the exact slot has since been taken on the calendar. */
export async function sendOwnerSlotUnavailableAlertEmail(d: BookingEmailDetails & { bookingId: string }): Promise<void> {
  const subject = `ACTION NEEDED — slot no longer free — ${d.customerName}`;
  const text = [
    `You tried to confirm this booking, but the exact requested time is no longer free on your calendar (something else was booked in the meantime).`,
    ``,
    `Booking ID: ${d.bookingId}`,
    `Name: ${d.customerName}`,
    `Email: ${d.customerEmail}`,
    `Mobile: ${d.customerMobile}`,
    `Package: ${d.packageName}`,
    `Requested date: ${d.dateLabel}`,
    `Requested time: ${d.timeLabel}`,
    ...(d.amountLabel ? [`Amount claimed: ${d.amountLabel}`] : []),
    ``,
    `Please contact the customer directly to offer an alternative time.`
  ].join("\n");
  const html = `<div style="font-family:Georgia,serif;color:#1E1A16;line-height:1.6;"><p><strong>ACTION NEEDED:</strong> you tried to confirm this booking, but the exact requested time is no longer free on your calendar.</p><pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(text)}</pre></div>`;
  await sendEmail(OWNER_EMAIL, subject, html, text);
}
