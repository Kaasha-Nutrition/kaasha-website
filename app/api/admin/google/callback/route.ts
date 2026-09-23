import { NextRequest, NextResponse } from "next/server";
import { GOOGLE_OAUTH_STATE_COOKIE, isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { completeGoogleConnect } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

/**
 * Google redirects here after Vallari approves (or denies) calendar access
 * on the consent screen. This route requires her admin session to still be
 * valid, and checks the `state` value against the cookie set by
 * /api/admin/google/connect to guard against CSRF.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  if (!isAuthorizedAdminRequest(req)) {
    return NextResponse.redirect(new URL("/admin?google_error=session_expired", url.origin));
  }

  const error = url.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(new URL(`/admin?google_error=${encodeURIComponent(error)}`, url.origin));
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = req.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/admin?google_error=invalid_state", url.origin));
  }

  try {
    await completeGoogleConnect(code);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.redirect(new URL(`/admin?google_error=${encodeURIComponent(message)}`, url.origin));
  }

  const res = NextResponse.redirect(new URL("/admin?google_connected=1", url.origin));
  res.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
