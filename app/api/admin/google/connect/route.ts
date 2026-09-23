import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { GOOGLE_OAUTH_STATE_COOKIE, isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { buildGoogleAuthUrl, isGoogleOAuthConfigured } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

/**
 * Starts the OWNER-ONLY "Connect Google Calendar" flow from /admin.
 * Customers never hit this route — it requires an authenticated admin
 * session, exactly like the rest of /api/admin/*.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json(
      { error: "not_configured", message: "Google OAuth isn't configured yet. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI in Vercel." },
      { status: 503 }
    );
  }

  const state = crypto.randomBytes(24).toString("hex");
  const authUrl = buildGoogleAuthUrl(state);

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10
  });
  return res;
}
