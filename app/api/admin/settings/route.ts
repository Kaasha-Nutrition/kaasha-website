import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { DEFAULT_BOOKING_SETTINGS, getBookingSettings, saveBookingSettings, type BookingSettings } from "@/lib/booking-settings";
import { isGoogleConnected, isGoogleOAuthConfigured } from "@/lib/google-calendar";
import { isKvConfigured } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const settings = await getBookingSettings();
  return NextResponse.json({
    settings,
    kvConfigured: isKvConfigured(),
    googleOAuthConfigured: isGoogleOAuthConfigured(),
    googleConnected: await isGoogleConnected()
  });
}

function isValidSettings(body: unknown): body is BookingSettings {
  if (!body || typeof body !== "object") return false;
  const s = body as Record<string, unknown>;
  return (
    typeof s.timezone === "string" &&
    Array.isArray(s.workingDays) &&
    s.workingDays.every((d) => typeof d === "number" && d >= 0 && d <= 6) &&
    typeof s.startTime === "string" &&
    /^\d{2}:\d{2}$/.test(s.startTime) &&
    typeof s.endTime === "string" &&
    /^\d{2}:\d{2}$/.test(s.endTime) &&
    typeof s.slotMinutes === "number" &&
    s.slotMinutes > 0 &&
    typeof s.bufferMinutes === "number" &&
    s.bufferMinutes >= 0 &&
    typeof s.minNoticeHours === "number" &&
    s.minNoticeHours >= 0 &&
    typeof s.maxWindowDays === "number" &&
    s.maxWindowDays > 0
  );
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isKvConfigured()) {
    return NextResponse.json({ error: "not_configured", message: "Vercel KV isn't connected yet." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const merged = { ...DEFAULT_BOOKING_SETTINGS, ...(body as object) };
  if (!isValidSettings(merged)) {
    return NextResponse.json({ error: "invalid_settings", message: "One or more settings values are invalid." }, { status: 400 });
  }

  await saveBookingSettings(merged);
  return NextResponse.json({ success: true, settings: merged });
}
