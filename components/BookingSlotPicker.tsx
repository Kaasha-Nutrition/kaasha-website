"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { WhatsappIcon } from "./icons";
import { SERVICES } from "@/lib/data";
import { useBooking } from "@/lib/booking-context";

const BOOKABLE = SERVICES.filter((s) => s.cat !== "soon");

interface AvailabilityResponse {
  available: boolean;
  slots?: string[];
  timezone?: string;
  reason?: string;
  message?: string;
}

interface BookingSuccess {
  name: string;
  email: string;
  mobile: string;
  packageName: string;
  date: string;
  time: string;
  dateLabel: string;
  timeLabel: string;
  timezone: string;
  startISO?: string;
  endISO?: string;
  eventLink?: string;
  emailSent: boolean;
}

function todayLocalDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatTimeButtonLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

function toGCalUtc(iso: string): string {
  return iso.replace(/[-:]/g, "").split(".")[0] + "Z";
}

export default function BookingSlotPicker() {
  const { selectedService, setSelectedService } = useBooking();

  // null = still checking whether live booking is available at all.
  const [liveEnabled, setLiveEnabled] = useState<boolean | null>(null);

  const [date, setDate] = useState(todayLocalDateString());
  const [slots, setSlots] = useState<string[]>([]);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "slot_taken" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingSuccess | null>(null);

  const selected = BOOKABLE.find((s) => s.name === selectedService) ?? null;
  const minDate = useMemo(() => todayLocalDateString(), []);

  // Once, on mount: check whether the live booking backend is configured
  // and connected at all. If not, fall back to the manual WhatsApp/email
  // flow rather than showing a picker that can never load slots.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/availability?date=${todayLocalDateString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: AvailabilityResponse) => {
        if (cancelled) return;
        setLiveEnabled(Boolean(data.available));
      })
      .catch(() => {
        if (!cancelled) setLiveEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (liveEnabled !== true) return;
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedTime(null);
    fetch(`/api/availability?date=${date}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: AvailabilityResponse) => {
        if (cancelled) return;
        if (!data.available) {
          setSlotsError(data.message || "Booking is temporarily unavailable. Please reach out via WhatsApp or email.");
          setSlots([]);
        } else {
          setSlots(data.slots || []);
          if (data.timezone) setTimezone(data.timezone);
        }
      })
      .catch(() => {
        if (!cancelled) setSlotsError("Couldn't load available times. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date, liveEnabled]);

  function buildManualMessage(): string | null {
    if (!name.trim() || !mobile.trim() || !selectedService) {
      alert("Please fill in your name, mobile number and select a service.");
      return null;
    }
    return [
      "New Package Inquiry",
      "Customer Name: " + name.trim(),
      "Phone: " + mobile.trim(),
      "Email: " + (email.trim() || "—"),
      "Selected Package: " + selectedService,
      "Message/Goal: " + (message.trim() || "—")
    ].join("\n");
  }

  function handleManualWhatsapp() {
    const msg = buildManualMessage();
    if (!msg) return;
    window.open("https://wa.me/917769090258?text=" + encodeURIComponent(msg), "_blank");
  }

  function handleManualEmail() {
    const msg = buildManualMessage();
    if (!msg) return;
    const subject = "New Package Inquiry — " + selectedService;
    window.location.href = "mailto:vallari@kaasha.in?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(msg);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedService) {
      alert("Please select a service.");
      return;
    }
    if (!selectedTime) {
      alert("Please choose an available time.");
      return;
    }
    if (!name.trim() || !mobile.trim() || !email.trim()) {
      alert("Please fill in your name, mobile number and email.");
      return;
    }

    setSubmitState("submitting");
    setSubmitError(null);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          packageName: selectedService,
          date,
          time: selectedTime,
          message: message.trim()
        })
      });
      const json = await res.json();

      if (res.status === 409 || json.error === "slot_taken") {
        setSubmitState("slot_taken");
        setSelectedTime(null);
        // Refresh the slot list so the taken time disappears.
        setSlotsLoading(true);
        const refreshed = await fetch(`/api/availability?date=${date}`, { cache: "no-store" }).then((r) => r.json());
        setSlots(refreshed.slots || []);
        setSlotsLoading(false);
        return;
      }

      if (!res.ok) {
        setSubmitState("error");
        setSubmitError(json.message || "Something went wrong. Please try again or reach out via WhatsApp.");
        return;
      }

      setResult(json.booking as BookingSuccess);
      setSubmitState("idle");
    } catch {
      setSubmitState("error");
      setSubmitError("Something went wrong. Please try again or reach out via WhatsApp.");
    }
  }

  // ---------- Success / confirmation screen ----------
  if (result) {
    const gcalUrl =
      result.startISO && result.endISO
        ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
            "Kaasha — " + result.packageName
          )}&dates=${toGCalUtc(result.startISO)}/${toGCalUtc(result.endISO)}&details=${encodeURIComponent(
            "Appointment with Kaasha by Vallari Shah."
          )}`
        : null;
    const waMessage = `Hi Vallari, I have booked a ${result.packageName} appointment for ${result.dateLabel} at ${result.timeLabel}. Name: ${result.name} Email: ${result.email}`;

    return (
      <div className="booking-panel booking-confirmed">
        <div className="confirm-icon" aria-hidden="true">
          ✓
        </div>
        <h3>Your appointment is confirmed</h3>
        <div className="confirm-details">
          <div>
            <span className="label">Package</span>
            <span>{result.packageName}</span>
          </div>
          <div>
            <span className="label">Date</span>
            <span>{result.dateLabel}</span>
          </div>
          <div>
            <span className="label">Time</span>
            <span>{result.timeLabel}</span>
          </div>
        </div>
        <p className="admin-hint">
          A confirmation has been sent to {result.email}
          {result.emailSent ? "." : " — if it doesn't arrive shortly, please check your spam folder or reach out directly."}
        </p>
        <div className="form-actions">
          {gcalUrl && (
            <a className="btn btn-ghost" href={gcalUrl} target="_blank" rel="noopener">
              Add to Google Calendar
            </a>
          )}
          <a className="btn btn-whatsapp" href={`https://wa.me/917769090258?text=${encodeURIComponent(waMessage)}`} target="_blank" rel="noopener">
            <WhatsappIcon width={17} height={17} />
            Message us on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  // ---------- Still checking whether live booking is available ----------
  if (liveEnabled === null) {
    return (
      <div className="booking-panel">
        <p className="admin-loading">Loading booking availability…</p>
      </div>
    );
  }

  // ---------- Fallback: legacy manual WhatsApp/email inquiry flow ----------
  if (liveEnabled === false) {
    return (
      <div className="booking-panel">
        <div className="booking-panel-head">
          <h3>Select a service &amp; send your details</h3>
          <span className="tz-badge">India Standard Time (IST)</span>
        </div>

        <div className="field">
          <label htmlFor="f-service">Service *</label>
          <select id="f-service" required value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
            <option value="">Choose a service…</option>
            {BOOKABLE.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} — ₹{s.price!.toLocaleString("en-IN")} / {s.duration}
              </option>
            ))}
          </select>
        </div>

        <p className="note-box">This isn&apos;t a live calendar right now — send your details and Vallari will confirm the exact slot with you directly over WhatsApp or email.</p>

        <div className="panel-divider" />
        <h4 className="panel-subhead">Your details</h4>

        <div className="field-row">
          <div className="field">
            <label htmlFor="f-name">Full name *</label>
            <input id="f-name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="f-mobile">Mobile number *</label>
            <input id="f-mobile" type="tel" required autoComplete="tel" placeholder="+91" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="f-email">Email</label>
          <input id="f-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="f-message">Message / goal</label>
          <textarea id="f-message" placeholder="Tell Vallari a bit about your goal…" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <p className="required-note">* required fields</p>
        <div className="form-actions">
          <button type="button" className="btn btn-whatsapp" onClick={handleManualWhatsapp}>
            <WhatsappIcon width={17} height={17} />
            Send via WhatsApp
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleManualEmail}>
            Send via Email
          </button>
        </div>
      </div>
    );
  }

  // ---------- Live slot picker ----------
  return (
    <form className="booking-panel" onSubmit={handleSubmit} noValidate>
      <div className="booking-panel-head">
        <h3>Select a service, date &amp; time</h3>
        <span className="tz-badge">India Standard Time (IST)</span>
      </div>

      <div className="field">
        <label htmlFor="f-service">Service *</label>
        <select id="f-service" required value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
          <option value="">Choose a service…</option>
          {BOOKABLE.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} — ₹{s.price!.toLocaleString("en-IN")} / {s.duration}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-date">Date *</label>
        <input id="f-date" type="date" required min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="field">
        <label>Available times *</label>
        {slotsLoading ? (
          <p className="admin-loading">Checking availability…</p>
        ) : slotsError ? (
          <p className="admin-warning">{slotsError}</p>
        ) : slots.length === 0 ? (
          <p className="svc-empty">No open slots on this date — please try another day.</p>
        ) : (
          <div className="slot-grid">
            {slots.map((t) => (
              <button
                key={t}
                type="button"
                className={`slot-chip${selectedTime === t ? " active" : ""}`}
                onClick={() => setSelectedTime(t)}
              >
                {formatTimeButtonLabel(t)}
              </button>
            ))}
          </div>
        )}
      </div>

      {submitState === "slot_taken" && (
        <p className="admin-warning">Sorry, this time slot is no longer available. Please choose another available time.</p>
      )}

      <div className="panel-divider" />
      <h4 className="panel-subhead">Your details</h4>

      <div className="field-row">
        <div className="field">
          <label htmlFor="f-name">Full name *</label>
          <input id="f-name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="f-mobile">Mobile number *</label>
          <input id="f-mobile" type="tel" required autoComplete="tel" placeholder="+91" value={mobile} onChange={(e) => setMobile(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="f-email">Email *</label>
        <input id="f-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="f-message">Message / goal</label>
        <textarea id="f-message" placeholder="Tell Vallari a bit about your goal…" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <p className="required-note">* required fields</p>

      {submitState === "error" && <p className="admin-error">{submitError}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitState === "submitting"}>
          {submitState === "submitting" ? "Booking…" : "Confirm Booking"}
        </button>
      </div>
      <p className="admin-hint">Prefer to message directly instead? WhatsApp us at +91 77690 90258 or email vallari@kaasha.in.</p>
    </form>
  );
}
