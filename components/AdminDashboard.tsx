"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { BookingSettings, WeeklySlot } from "@/lib/booking-settings";

interface SettingsResponse {
  settings: BookingSettings;
  kvConfigured: boolean;
  googleOAuthConfigured: boolean;
  paymentsConfigured: boolean;
  googleConnected: boolean;
  minimumBookingFeeLabel: string;
}

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminDashboard() {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [data, setData] = useState<SettingsResponse | null>(null);
  const [form, setForm] = useState<BookingSettings | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [googleNotice, setGoogleNotice] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  async function loadSettings() {
    const res = await fetch("/api/admin/settings", { cache: "no-store" });
    if (res.status === 401) {
      setLoggedIn(false);
      setChecking(false);
      return;
    }
    const json = (await res.json()) as SettingsResponse;
    setData(json);
    setForm(json.settings);
    setLoggedIn(true);
    setChecking(false);
  }

  useEffect(() => {
    loadSettings();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("google_connected")) setGoogleNotice("Google Calendar connected successfully.");
      if (params.get("google_error")) setGoogleNotice(`Couldn't connect Google Calendar: ${params.get("google_error")}`);
      if (params.get("google_connected") || params.get("google_error")) {
        window.history.replaceState({}, "", "/admin");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setLoginError(json.message || "Incorrect password.");
        setLoggingIn(false);
        return;
      }
      setPassword("");
      await loadSettings();
    } catch {
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setLoggedIn(false);
    setData(null);
    setForm(null);
  }

  function addWeeklySlot() {
    if (!form) return;
    setForm({ ...form, weeklySlots: [...form.weeklySlots, { day: 2, time: "17:00" }] });
  }

  function updateWeeklySlot(index: number, patch: Partial<WeeklySlot>) {
    if (!form) return;
    const weeklySlots = form.weeklySlots.map((s, i) => (i === index ? { ...s, ...patch } : s));
    setForm({ ...form, weeklySlots });
  }

  function removeWeeklySlot(index: number) {
    if (!form) return;
    setForm({ ...form, weeklySlots: form.weeklySlots.filter((_, i) => i !== index) });
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaveState("saving");
    setSaveError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveState("error");
        setSaveError(json.message || "Couldn't save settings.");
        return;
      }
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveState("error");
      setSaveError("Something went wrong. Please try again.");
    }
  }

  async function handleDisconnectGoogle() {
    setDisconnecting(true);
    await fetch("/api/admin/google/disconnect", { method: "POST" });
    await loadSettings();
    setDisconnecting(false);
  }

  if (checking) {
    return (
      <div className="admin-shell">
        <p className="admin-loading">Loading…</p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="admin-shell">
        <div className="admin-login-card">
          <h1>Kaasha Admin</h1>
          <p className="admin-sub">Sign in to manage booking availability and your Google Calendar connection.</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {loginError && <p className="admin-error">{loginError}</p>}
            <button type="submit" className="btn btn-primary" disabled={loggingIn}>
              {loggingIn ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!data || !form) return null;

  return (
    <div className="admin-shell">
      <div className="admin-header-row">
        <div>
          <h1>Kaasha Admin</h1>
          <p className="admin-sub">Manage your booking availability and Google Calendar connection.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          Sign out
        </button>
      </div>

      {googleNotice && <p className="admin-notice">{googleNotice}</p>}

      <section className="admin-card">
        <h2>Google Calendar</h2>
        {!data.kvConfigured && (
          <p className="admin-warning">
            Vercel KV isn&apos;t connected yet — availability settings and calendar connection can&apos;t be saved until it is. Add a KV
            database to this project in the Vercel dashboard (Storage → Create Database → KV).
          </p>
        )}
        {!data.googleOAuthConfigured && (
          <p className="admin-warning">
            Google OAuth isn&apos;t configured yet — add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI in the Vercel
            dashboard first.
          </p>
        )}
        {!data.paymentsConfigured && (
          <p className="admin-warning">
            PhonePe payments aren&apos;t configured yet — add PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET in the Vercel dashboard before
            going live. Until then, the booking form falls back to WhatsApp/email inquiries automatically.
          </p>
        )}
        {data.googleOAuthConfigured && data.kvConfigured && (
          <div className="admin-google-status">
            {data.googleConnected ? (
              <>
                <span className="admin-pill admin-pill-good">Connected</span>
                <button type="button" className="btn btn-ghost" onClick={handleDisconnectGoogle} disabled={disconnecting}>
                  {disconnecting ? "Disconnecting…" : "Disconnect"}
                </button>
              </>
            ) : (
              <>
                <span className="admin-pill admin-pill-warn">Not connected</span>
                <a className="btn btn-primary" href="/api/admin/google/connect">
                  Connect Google Calendar
                </a>
              </>
            )}
          </div>
        )}
        <p className="admin-hint">
          Only your calendar&apos;s free/busy status is ever read — customers never see event titles or details, only whether a time is
          available.
        </p>
      </section>

      <section className="admin-card">
        <h2>Availability settings</h2>
        <form onSubmit={handleSave} className="admin-settings-form">
          <div className="field">
            <label>Weekly appointment slots</label>
            <p className="admin-hint" style={{ marginTop: 0 }}>
              The exact times you offer each week — not a full working-day grid. A listed slot only shows as bookable when it&apos;s also
              free on your Google Calendar that particular week.
            </p>
            {form.weeklySlots.length === 0 && <p className="svc-empty">No weekly slots yet — add at least one below.</p>}
            {form.weeklySlots.map((slot, i) => (
              <div className="field-row" key={i} style={{ alignItems: "flex-end" }}>
                <div className="field">
                  <label htmlFor={`slot-day-${i}`}>Day</label>
                  <select id={`slot-day-${i}`} value={slot.day} onChange={(e) => updateWeeklySlot(i, { day: Number(e.target.value) })}>
                    {DAY_LABELS.map((label, d) => (
                      <option key={label} value={d}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor={`slot-time-${i}`}>Time</label>
                  <input
                    id={`slot-time-${i}`}
                    type="time"
                    value={slot.time}
                    onChange={(e) => updateWeeklySlot(i, { time: e.target.value })}
                  />
                </div>
                <button type="button" className="btn btn-ghost" onClick={() => removeWeeklySlot(i)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost" onClick={addWeeklySlot}>
              + Add a weekly slot
            </button>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="appointmentMinutes">Appointment length (minutes)</label>
              <input
                id="appointmentMinutes"
                type="number"
                min={5}
                step={5}
                value={form.appointmentMinutes}
                onChange={(e) => setForm({ ...form, appointmentMinutes: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="minNoticeHours">Minimum notice (hours)</label>
              <input
                id="minNoticeHours"
                type="number"
                min={0}
                value={form.minNoticeHours}
                onChange={(e) => setForm({ ...form, minNoticeHours: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label htmlFor="maxWindowDays">How far ahead customers can book (days)</label>
              <input
                id="maxWindowDays"
                type="number"
                min={1}
                value={form.maxWindowDays}
                onChange={(e) => setForm({ ...form, maxWindowDays: Number(e.target.value) })}
              />
            </div>
          </div>

          <p className="admin-hint">Timezone is fixed to {form.timezone} for the practice.</p>

          {saveState === "error" && <p className="admin-error">{saveError}</p>}
          <button type="submit" className="btn btn-primary" disabled={saveState === "saving" || !data.kvConfigured}>
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : "Save settings"}
          </button>
        </form>
      </section>

      <section className="admin-card">
        <h2>Booking payment</h2>
        <p>
          Every booking requires a minimum payment of <strong>{data.minimumBookingFeeLabel}</strong> via PhonePe to confirm the slot.
        </p>
        <p className="admin-hint">
          This amount is set in code (<code>lib/booking-fees.ts</code>), not here — it&apos;s a deliberate safeguard so it can never be
          changed accidentally from this dashboard. Ask your developer to update it if it needs to change. Refunds for payments that
          couldn&apos;t be matched to a confirmed slot are issued manually from the PhonePe dashboard.
        </p>
      </section>
    </div>
  );
}
