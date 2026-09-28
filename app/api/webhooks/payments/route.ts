import { NextRequest, NextResponse } from "next/server";
import { finalizeBooking } from "@/lib/booking-finalize";
import { extractBookingIdFromWebhook, isWebhookConfigured, verifyWebhookAuthorization, type WebhookBody } from "@/lib/payments";

export const dynamic = "force-dynamic";

/**
 * PhonePe's server-to-server payment callback — the AUTHORITATIVE
 * confirmation path that doesn't depend on the customer's browser ever
 * returning (closed tab, network drop, switched to a UPI app and back
 * late). Configure this URL in PhonePe Business Dashboard → Developer
 * Settings → Webhook, using the "SHA (Username & Password)" auth method
 * with PHONEPE_WEBHOOK_USERNAME / PHONEPE_WEBHOOK_PASSWORD.
 *
 * A request that fails signature verification is rejected outright and
 * never touches booking state. A verified request is still never trusted
 * for its claimed payment status — finalizeBooking() always re-checks with
 * PhonePe's Order Status API directly before doing anything.
 */
export async function POST(req: NextRequest) {
  if (!isWebhookConfigured()) {
    // Not configured yet — nothing to verify against, so refuse rather
    // than silently accepting unauthenticated callbacks.
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const authHeader = req.headers.get("authorization");
  if (!verifyWebhookAuthorization(authHeader)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let body: WebhookBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const bookingId = extractBookingIdFromWebhook(body);
  if (!bookingId) {
    // Verified sender, but we can't tell which booking this is about —
    // acknowledge so PhonePe doesn't retry forever, but do nothing.
    return NextResponse.json({ received: true, note: "no bookingId found in payload" });
  }

  const outcome = await finalizeBooking(bookingId);
  return NextResponse.json({ received: true, bookingId, outcome: outcome.status });
}
