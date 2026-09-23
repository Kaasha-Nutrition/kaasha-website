/**
 * Server-only Google Calendar integration, built on plain `fetch` (no
 * `googleapis` package). Two separate concerns live here:
 *
 *  - The OWNER OAuth flow (Vallari connects her calendar once, from the
 *    password-gated /admin page). This is the ONLY place Google credentials
 *    are ever used — customers never see or trigger any of this.
 *  - Reading her calendar's busy times (freeBusy) and creating events, using
 *    the refresh token obtained from that one-time consent, refreshed
 *    automatically as needed.
 *
 * Required environment variables (set only in the Vercel dashboard, never
 * in source or in chat): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
 * GOOGLE_REDIRECT_URI. Only the `calendar.events` scope is requested —
 * enough to check free/busy and create events, nothing broader.
 */

import { isKvConfigured, kvDel, kvGet, kvSet } from "./kv";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const SCOPE = "https://www.googleapis.com/auth/calendar.events";

const REFRESH_TOKEN_KEY = "kaasha:google-refresh-token";
const ACCESS_TOKEN_CACHE_KEY = "kaasha:google-access-token";

function env(name: string): string | null {
  return process.env[name] || null;
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(env("GOOGLE_CLIENT_ID") && env("GOOGLE_CLIENT_SECRET") && env("GOOGLE_REDIRECT_URI"));
}

/** Whether Vallari has completed the one-time "Connect Google Calendar" step. */
export async function isGoogleConnected(): Promise<boolean> {
  if (!isKvConfigured()) return false;
  const token = await kvGet(REFRESH_TOKEN_KEY);
  return Boolean(token);
}

/** Build the Google consent-screen URL for the owner-only connect flow. */
export function buildGoogleAuthUrl(state: string): string {
  const clientId = env("GOOGLE_CLIENT_ID");
  const redirectUri = env("GOOGLE_REDIRECT_URI");
  if (!clientId || !redirectUri) {
    throw new Error("Google OAuth is not configured (GOOGLE_CLIENT_ID / GOOGLE_REDIRECT_URI missing).");
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: SCOPE,
    state
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/** Exchange the one-time authorization code for tokens and store the refresh token in KV. */
export async function completeGoogleConnect(code: string): Promise<void> {
  const clientId = env("GOOGLE_CLIENT_ID");
  const clientSecret = env("GOOGLE_CLIENT_SECRET");
  const redirectUri = env("GOOGLE_REDIRECT_URI");
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth is not configured.");
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google token exchange failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { refresh_token?: string; access_token?: string; expires_in?: number };
  if (!data.refresh_token) {
    // Google omits refresh_token if the account has already granted consent
    // before without `prompt=consent`. We always send prompt=consent, so
    // this should only happen on a genuinely unexpected response.
    throw new Error(
      "Google did not return a refresh token. Please disconnect and try connecting again, making sure to approve all requested permissions."
    );
  }

  await kvSet(REFRESH_TOKEN_KEY, data.refresh_token);
  if (data.access_token && data.expires_in) {
    await kvSet(ACCESS_TOKEN_CACHE_KEY, data.access_token, Math.max(60, data.expires_in - 60));
  }
}

/** Remove the stored refresh token, fully disconnecting the calendar. */
export async function disconnectGoogle(): Promise<void> {
  await kvDel(REFRESH_TOKEN_KEY);
  await kvDel(ACCESS_TOKEN_CACHE_KEY);
}

class GoogleNotConnectedError extends Error {
  constructor() {
    super("Google Calendar is not connected yet. Please connect it from /admin.");
    this.name = "GoogleNotConnectedError";
  }
}

/** Get a valid access token, refreshing (and caching) it as needed. */
async function getAccessToken(): Promise<string> {
  const cached = await kvGet(ACCESS_TOKEN_CACHE_KEY);
  if (cached) return cached;

  const clientId = env("GOOGLE_CLIENT_ID");
  const clientSecret = env("GOOGLE_CLIENT_SECRET");
  const refreshToken = await kvGet(REFRESH_TOKEN_KEY);
  if (!clientId || !clientSecret) throw new Error("Google OAuth is not configured.");
  if (!refreshToken) throw new GoogleNotConnectedError();

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google token refresh failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  await kvSet(ACCESS_TOKEN_CACHE_KEY, data.access_token, Math.max(60, data.expires_in - 60));
  return data.access_token;
}

export interface BusyInterval {
  start: string; // ISO 8601
  end: string; // ISO 8601
}

/**
 * Return Vallari's busy intervals for the given range. Deliberately uses
 * the `freeBusy` endpoint (not `events.list`), which returns only start/end
 * times — never event titles, attendees, or descriptions — so customers'
 * availability checks can never leak her private calendar's contents.
 */
export async function getBusyIntervals(timeMinISO: string, timeMaxISO: string, timezone: string): Promise<BusyInterval[]> {
  const accessToken = await getAccessToken();
  const calendarId = env("GOOGLE_CALENDAR_ID") || "primary";

  const res = await fetch(`${CALENDAR_API}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      timeMin: timeMinISO,
      timeMax: timeMaxISO,
      timeZone: timezone,
      items: [{ id: calendarId }]
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google freeBusy query failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { calendars: Record<string, { busy: BusyInterval[] }> };
  return data.calendars?.[calendarId]?.busy ?? [];
}

export interface CreateEventInput {
  summary: string;
  description: string;
  startISO: string;
  endISO: string;
  timezone: string;
}

export interface CreatedEvent {
  id: string;
  htmlLink: string;
}

/** Create the confirmed appointment on Vallari's calendar. */
export async function createCalendarEvent(input: CreateEventInput): Promise<CreatedEvent> {
  const accessToken = await getAccessToken();
  const calendarId = env("GOOGLE_CALENDAR_ID") || "primary";

  const res = await fetch(`${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.startISO, timeZone: input.timezone },
      end: { dateTime: input.endISO, timeZone: input.timezone }
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google event creation failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { id: string; htmlLink: string };
  return { id: data.id, htmlLink: data.htmlLink };
}

/** Small helper so callers can tell "not connected" apart from other failures. */
export function isNotConnectedError(err: unknown): boolean {
  return err instanceof GoogleNotConnectedError;
}
