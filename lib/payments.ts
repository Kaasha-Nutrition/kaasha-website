/**
 * Server-only PhonePe Payment Gateway integration (Standard Checkout,
 * OAuth-based API — PhonePe's current auth scheme as of late 2025/2026,
 * which replaced the older per-request salt/checksum signing), built on
 * plain `fetch` (no PhonePe SDK / npm package), matching this codebase's
 * zero-extra-dependency approach.
 *
 * Flow used by the booking system:
 *   1. createPaymentOrder()  — server creates an order for the exact
 *      booking-fee amount (amount is NEVER accepted from the browser).
 *   2. The browser is redirected to the returned `redirectUrl` (PhonePe's
 *      hosted checkout, which includes UPI QR / UPI-ID / cards / net
 *      banking automatically).
 *   3. getOrderStatus()      — called server-side, twice, independently:
 *      once when the browser returns to our redirect URL, and again from
 *      the PhonePe webhook handler. Both call this same function rather
 *      than trusting anything the browser or the webhook body claims —
 *      this is the authoritative check.
 *   4. verifyWebhookAuthorization() — confirms an inbound webhook request
 *      genuinely came from PhonePe before it's allowed to trigger anything.
 *
 * Required environment variables (Vercel dashboard only, never in source
 * or chat):
 *   PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, PHONEPE_CLIENT_VERSION
 *     (defaults to "1") — from PhonePe Business Dashboard → Developer
 *     Settings → API Keys.
 *   PHONEPE_ENV — "SANDBOX" (default) or "PRODUCTION".
 *   PHONEPE_WEBHOOK_USERNAME, PHONEPE_WEBHOOK_PASSWORD — the username/
 *     password YOU choose when creating the webhook in PhonePe Business
 *     Dashboard → Developer Settings → Webhook (SHA auth method). PhonePe
 *     hashes these into the Authorization header of every callback it
 *     sends; this code recomputes the same hash to confirm authenticity.
 *
 * NOTE ON API SHAPE: PhonePe's Standard Checkout v2 API details below were
 * confirmed against PhonePe's own developer documentation at the time this
 * was written. Payment integrations are worth a final sanity check against
 * the live PhonePe dashboard/docs during sandbox testing (§5 of the
 * architecture doc) before going live — field names occasionally shift
 * between API versions.
 */

import crypto from "node:crypto";
import { kvGet, kvSet } from "./kv";

function env(name: string): string | null {
  return process.env[name] || null;
}

function isProductionEnv(): boolean {
  return (env("PHONEPE_ENV") || "SANDBOX").toUpperCase() === "PRODUCTION";
}

export function isPaymentsConfigured(): boolean {
  return Boolean(env("PHONEPE_CLIENT_ID") && env("PHONEPE_CLIENT_SECRET"));
}

export function isWebhookConfigured(): boolean {
  return Boolean(env("PHONEPE_WEBHOOK_USERNAME") && env("PHONEPE_WEBHOOK_PASSWORD"));
}

function oauthUrl(): string {
  return isProductionEnv()
    ? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";
}

function apiBase(): string {
  return isProductionEnv() ? "https://api.phonepe.com/apis/pg" : "https://api-preprod.phonepe.com/apis/pg-sandbox";
}

const TOKEN_CACHE_KEY = "kaasha:phonepe-access-token";

export class PaymentsNotConfiguredError extends Error {
  constructor() {
    super("PhonePe payments are not configured (PHONEPE_CLIENT_ID / PHONEPE_CLIENT_SECRET missing).");
    this.name = "PaymentsNotConfiguredError";
  }
}

export function isPaymentsNotConfiguredError(err: unknown): boolean {
  return err instanceof PaymentsNotConfiguredError;
}

/** Get a cached (or freshly fetched) OAuth access token for the PhonePe API. */
async function getAccessToken(): Promise<string> {
  const cached = await kvGet(TOKEN_CACHE_KEY);
  if (cached) return cached;

  const clientId = env("PHONEPE_CLIENT_ID");
  const clientSecret = env("PHONEPE_CLIENT_SECRET");
  const clientVersion = env("PHONEPE_CLIENT_VERSION") || "1";
  if (!clientId || !clientSecret) throw new PaymentsNotConfiguredError();

  const res = await fetch(oauthUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_version: clientVersion,
      client_secret: clientSecret,
      grant_type: "client_credentials"
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PhonePe OAuth token request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token: string; expires_at: number };
  const nowSeconds = Math.floor(Date.now() / 1000);
  const ttlSeconds = Math.max(60, data.expires_at - nowSeconds - 60); // refresh a minute early
  await kvSet(TOKEN_CACHE_KEY, data.access_token, ttlSeconds);
  return data.access_token;
}

export interface CreateOrderInput {
  /** Our own booking ID — sent as PhonePe's `merchantOrderId`, the identifier we use everywhere else in the flow. */
  merchantOrderId: string;
  /** Amount in paise. Always computed server-side from lib/booking-fees.ts — never accepted from the browser. */
  amountPaise: number;
  /** Where PhonePe sends the customer's browser back to after checkout. */
  redirectUrl: string;
  /** 300–3600 seconds. Defaults to 900 (15 minutes), matching the slot-hold lock. */
  expireAfterSeconds?: number;
}

export interface CreateOrderResult {
  orderId: string;
  state: string;
  redirectUrl: string;
  expireAt: number;
}

/** Create a PhonePe payment order for the exact booking-fee amount. */
export async function createPaymentOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const accessToken = await getAccessToken();
  const expireAfter = Math.min(3600, Math.max(300, input.expireAfterSeconds ?? 900));

  const res = await fetch(`${apiBase()}/checkout/v2/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `O-Bearer ${accessToken}`
    },
    body: JSON.stringify({
      merchantOrderId: input.merchantOrderId,
      amount: input.amountPaise,
      expireAfter,
      metaInfo: { udf1: input.merchantOrderId }, // redundant copy of our booking ID, so the webhook can recover it even if its payload shape omits merchantOrderId
      paymentFlow: {
        type: "PG_CHECKOUT",
        merchantUrls: { redirectUrl: input.redirectUrl }
      }
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PhonePe order creation failed (${res.status}): ${text}`);
  }

  return (await res.json()) as CreateOrderResult;
}

export type PhonePeOrderState = "PENDING" | "COMPLETED" | "FAILED";

export interface OrderStatusResult {
  orderId: string;
  state: PhonePeOrderState;
  amount: number;
}

/**
 * Authoritative, server-to-server payment status check. This — not
 * anything the browser or a webhook body claims — is what a booking is
 * ever confirmed against.
 */
export async function getOrderStatus(merchantOrderId: string): Promise<OrderStatusResult> {
  const accessToken = await getAccessToken();
  const res = await fetch(`${apiBase()}/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status?details=false`, {
    method: "GET",
    headers: { Authorization: `O-Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PhonePe order status check failed (${res.status}): ${text}`);
  }

  return (await res.json()) as OrderStatusResult;
}

/**
 * Verify a PhonePe webhook request's `Authorization` header against the
 * SHA256(username:password) scheme PhonePe uses for dashboard-configured
 * "SHA (Username & Password)" webhooks. A callback that fails this check
 * is rejected outright — it is never trusted to mean anything.
 */
export function verifyWebhookAuthorization(authorizationHeader: string | null): boolean {
  if (!authorizationHeader) return false;
  const username = env("PHONEPE_WEBHOOK_USERNAME");
  const password = env("PHONEPE_WEBHOOK_PASSWORD");
  if (!username || !password) return false;

  const expected = crypto.createHash("sha256").update(`${username}:${password}`).digest("hex");
  const a = Buffer.from(authorizationHeader.trim().toLowerCase());
  const b = Buffer.from(expected.toLowerCase());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export interface WebhookBody {
  event: string;
  payload: {
    orderId?: string;
    merchantOrderId?: string;
    state?: PhonePeOrderState;
    amount?: number;
    metaInfo?: { udf1?: string };
  };
}

/** Best-effort extraction of our bookingId from a webhook payload, trying every field PhonePe might use for it. */
export function extractBookingIdFromWebhook(body: WebhookBody): string | null {
  return body.payload?.merchantOrderId || body.payload?.metaInfo?.udf1 || null;
}
