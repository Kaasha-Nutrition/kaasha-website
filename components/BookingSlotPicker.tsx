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

interface StartResponse {
  success: boolean;
  bookingId: string;
  amountPaise: number;
  dateLabel: string;
  timeLabel: string;
  checkoutUrl: string;
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

function formatRupees(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

/** The exact pre-filled WhatsApp inquiry message format the practice uses. */
function buildInquiryMessage(opts: {
  packageName: string;
  name: string;
  mobile: string;
  email: string;
  preferredDate?: string;
  preferredTime?: string;
  message: string;
}): string {
  return [
    `Hi Vallari, I would like to enquire about ${opts.packageName || "a service"}.`,
    ``,
    `Name: ${opts.name || "—"}`,
    `Mobile: ${opts.mobile || "—"}`,
    `Email: ${opts.email || "—"}`,
    `Preferred Date: ${opts.preferredDate || "—"}`,
    `Preferred Time: ${opts.preferredTime || "—"}`,
    `Goal/Message: ${opts.message || "—"}`
  ].join("\n");
}

type LiveStep = "form" | "summary" | "starting";

export default function BookingSlotPicker() {
  const { selectedService, setSelectedService } = useBooking();

  // null = still checking whether live booking is available at all.
  const [liveEnabled, setLiveEnabled] = useState<boolean | null>(null);

  const [date, setDate] = useState(todayLocalDateString());
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [liveStep, setLiveStep] = useState<LiveStep>("form");
  const [startResult, setStartResult] = useState<StartResponse | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "slot_taken" | "error">("idle");

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

  function handleManualWhatsapp() {
    if (!name.trim() || !mobile.trim() || !selectedService) {
      alert("Please fill in your name, mobile number and select a service.");
      return;
    }
    const msg = buildInquiryMessage({ packageName: selectedService, name, mobile, email, message });
    window.open("https://wa.me/917769090258?text=" + encodeURIComponent(msg), "_blank");
  }

  function handleManualEmail() {
    if (!name.trim() || !mobile.trim() || !selectedService) {
      alert("Please fill in your name, mobile number and select a service.");
      return;
    }
    const msg = buildInquiryMessage({ packageName: selectedService, name, mobile, email, message });
    const subject = "New Package Inquiry — " + selectedService;
    window.location.href = "mailto:vallari@kaasha.in?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(msg);
  }

  function handleReviewBooking(e: FormEvent) {
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
    setLiveStep("summary");
  }

  async function handleProceedToPay() {
    setLiveStep("starting");
    setStartError(null);
    try {
      const res = await fetch("/api/booking/start", {
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
        setLiveStep("form");
        setSelectedTime(null);
        setSlotsLoading(true);
        const refreshed = await fetch(`/api/availability?date=${date}`, { cache: "no-store" }).then((r) => r.json());
        setSlots(refreshed.slots || []);
        setSlotsLoading(false);
        return;
      }

      if (!res.ok) {
        setSubmitState("error");
        setStartError(json.message || "Something went wrong. Please try again or reach out via WhatsApp.");
        setLiveStep("summary");
        return;
      }

      setStartResult(json as StartResponse);
      // Full-page redirect to PhonePe's hosted checkout — this is a real
      // payment page, not something to render inline.
      window.location.href = (json as StartResponse).checkoutUrl;
    } catch {
      setSubmitState("error");
      setStartError("Something went wrong starting payment. Please try again or reach out via WhatsApp.");
      setLiveStep("summary");
    }
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

  // ---------- Live flow, step 2: booking summary + "Proceed to Pay" ----------
  if (liveStep === "summary" || liveStep === "starting") {
    const amount = startResult?.amountPaise ?? 50000;
    const selectedPkg = BOOKABLE.find((s) => s.name === selectedService) ?? null;
    const balanceDue = selectedPkg?.price != null ? Math.max(0, selectedPkg.price - Math.round(amount / 100)) : null;
    return (
      <div className="booking-panel">
        <div className="booking-panel-head">
          <h3>Booking summary</h3>
          <span className="tz-badge">India Standard Time (IST)</span>
        </div>
        <div className="confirm-details">
          <div>
            <span className="label">Service</span>
            <span>{selectedService}</span>
          </div>
          <div>
            <span className="label">Date</span>
            <span>{date}</span>
          </div>
          <div>
            <span className="label">Time</span>
            <span>{selectedTime ? formatTimeButtonLabel(selectedTime) : "—"}</span>
          </div>
          <div>
            <span className="label">Name</span>
            <span>{name}</span>
          </div>
          <div>
            <span className="label">Mobile</span>
            <span>{mobile}</span>
          </div>
          <div>
            <span className="label">Email</span>
            <span>{email}</span>
          </div>
        </div>
        <p className="note-box">
          A booking fee of <strong>{formatRupees(amount)}</strong> is due now to confirm this slot — this holds it for 15 minutes while
          you complete payment, and your appointment is only confirmed once payment is verified.
          {balanceDue !== null && balanceDue > 0 && (
            <>
              {" "}
              The remaining <strong>{formatRupees(balanceDue * 100)}</strong> of the {selectedPkg?.name}&apos;s {formatRupees((selectedPkg?.price || 0) * 100)}{" "}
              fee is payable directly to Vallari after your consultation — not through this website.
            </>
          )}
        </p>
        {startError && <p className="admin-error">{startError}</p>}
        <div className="form-actions">
          <button type="button" className="btn btn-primary" disabled={liveStep === "starting"} onClick={handleProceedToPay}>
            {liveStep === "starting" ? "Starting payment…" : `Proceed to Pay ${formatRupees(amount)}`}
          </button>
          <button type="button" className="btn btn-ghost" disabled={liveStep === "starting"} onClick={() => setLiveStep("form")}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // ---------- Live flow, step 1: service, date &amp; time + details ----------
  return (
    <form className="booking-panel" onSubmit={handleReviewBooking} noValidate>
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

      {submitState === "error" && <p className="admin-error">{startError}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Review &amp; Pay
        </button>
      </div>
      <p className="admin-hint">Prefer to message directly instead? WhatsApp us at +91 77690 90258 or email vallari@kaasha.in.</p>
    </form>
  );
}
