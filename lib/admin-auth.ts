/**
 * Minimal owner-only session auth for /admin. Deliberately not a full
 * auth library — there is exactly one admin (Vallari), gated by a single
 * password, so a small HMAC-signed cookie is enough and keeps this
 * codebase's zero-extra-dependency approach. Uses Node's built-in `crypto`
 * (no npm package).
 *
 * Configure ADMIN_PASSWORD (the password Vallari logs in with) and
 * ADMIN_SESSION_SECRET (any long random string, used only to sign session
 * cookies — not a password anyone types) in the Vercel dashboard.
 */

import crypto from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "kaasha_admin_session";
/** Short-lived CSRF-protection cookie for the Google "Connect" round-trip (see app/api/admin/google/connect and .../callback). */
export const GOOGLE_OAUTH_STATE_COOKIE = "kaasha_google_oauth_state";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function sessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || null;
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && sessionSecret());
}

/** Timing-safe check of the submitted password against ADMIN_PASSWORD. */
export function checkAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function sign(payload: string): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/** Create a signed session token (payload.signature) with a 7-day expiry. */
export function createAdminSessionToken(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

/** Verify a session token's signature and expiry. */
export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return false;
  }

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp: number };
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

/** Convenience check used by every protected /api/admin/* route. */
export function isAuthorizedAdminRequest(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}
