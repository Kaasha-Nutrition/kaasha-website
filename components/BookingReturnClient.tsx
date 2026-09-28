"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WhatsappIcon } from "./icons";

interface ConfirmedBooking {
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
  amountPaise: number;
  emailSent: boolean;
}

type Outcome =
  | { kind: "checking" }
  | { kind: "pending" }
  | { kind: "confirmed"; booking: ConfirmedBooking }
  | { kind: "payment_failed"; message: string }
  | { kind: "slot_lost"; message: string }
  | { kind: "error"; message: string }
  | { kind: "missing" };

const MAX_POLLS = 12; // ~ up to 36 seconds of polling (3s apart) before giving up and showing a "still processing" message
const POLL_INTERVAL_MS = 3000;

function toGCalUtc(iso: string): string {
  return iso.replace(/[-:]/g, "").split(".")[0] + "Z";
}

function formatRupees(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

export default function BookingReturnClient() {
  const [outcome, setOutcome] = useState<Outcome>({ kind: "checking" });
  const attemptsRef = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("bookingId");
    if (!bookingId) {
      setOutcome({ kind: "missing" });
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      attemptsRef.current += 1;
      try {
        const res = await fetch("/api/booking/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId })
        });
        const json = await res.json();
        if (cancelled) return;

        if (json.status === "confirmed") {
          setOutcome({ kind: "confirmed", booking: json.booking });
          return;
        }
        if (json.status === "payment_failed") {
          setOutcome({ kind: "payment_failed", message: json.message });
          return;
        }
        if (json.status === "payment_captured_slot_lost") {
          setOutcome({ kind: "slot_lost", message: json.message });
          return;
        }
        if (json.status === "not_found") {
          setOutcome({ kind: "error", message: "We couldn't find that booking. Please reach out via WhatsApp and we'll sort it out." });
          return;
        }
        // "pending" or "processing" — keep polling, up to MAX_POLLS.
        if (attemptsRef.current >= MAX_POLLS) {
          setOutcome({ kind: "pending" });
          return;
        }
        setOutcome({ kind: "checking" });
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (cancelled) return;
        if (attemptsRef.current >= MAX_POLLS) {
          setOutcome({ kind: "error", message: "We're having trouble confirming your booking. Please reach out via WhatsApp and we'll sort it out." });
          return;
        }
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (outcome.kind === "missing") {
    return (
      <div className="booking-panel">
        <h3>Nothing to confirm here</h3>
        <p className="admin-hint">This page is only reached after starting a payment from the booking form.</p>
        <div className="form-actions">
          <Link className="btn btn-primary" href="/#contact">
            Back to booking
          </Link>
        </div>
      </div>
    );
  }

  if (outcome.kind === "checking" || outcome.kind === "pending") {
    return (
      <div className="booking-panel">
        <p className="admin-loading">
          {outcome.kind === "pending" ? "Still confirming your payment — this can take a minute." : "Confirming your payment…"}
        </p>
        <p className="admin-hint">Please don&apos;t close this page yet. If this takes more than a couple of minutes, message us on WhatsApp with your name and we&apos;ll check right away.</p>
        <div className="form-actions">
          <a className="btn btn-whatsapp" href="https://wa.me/917769090258" target="_blank" rel="noopener">
            <WhatsappIcon width={17} height={17} />
            Message us on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  if (outcome.kind === "payment_failed") {
    return (
      <div className="booking-panel">
        <h3>Payment wasn&apos;t successful</h3>
        <p className="admin-warning">{outcome.message}</p>
        <p className="admin-hint">You have not been charged. Your slot has been released — please try booking again.</p>
        <div className="form-actions">
          <Link className="btn btn-primary" href="/#contact">
            Try again
          </Link>
          <a className="btn btn-ghost" href="https://wa.me/917769090258" target="_blank" rel="noopener">
            WhatsApp us instead
          </a>
        </div>
      </div>
    );
  }

  if (outcome.kind === "slot_lost") {
    return (
      <div className="booking-panel">
        <h3>Payment received — confirming your exact slot</h3>
        <p className="admin-warning">{outcome.message}</p>
        <div className="form-actions">
          <a className="btn btn-whatsapp" href="https://wa.me/917769090258?text=Hi%20Vallari%2C%20I%20just%20paid%20for%20a%20booking%20and%20need%20help%20confirming%20my%20exact%20slot." target="_blank" rel="noopener">
            <WhatsappIcon width={17} height={17} />
            Message us on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  if (outcome.kind === "error") {
    return (
      <div className="booking-panel">
        <h3>Something went wrong</h3>
        <p className="admin-error">{outcome.message}</p>
        <div className="form-actions">
          <a className="btn btn-whatsapp" href="https://wa.me/917769090258" target="_blank" rel="noopener">
            <WhatsappIcon width={17} height={17} />
            Message us on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  // confirmed
  const result = outcome.booking;
  const gcalUrl =
    result.startISO && result.endISO
      ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
          "Kaasha — " + result.packageName
        )}&dates=${toGCalUtc(result.startISO)}/${toGCalUtc(result.endISO)}&details=${encodeURIComponent(
          "Appointment with Kaasha by Vallari Shah."
        )}`
      : null;
  const waMessage = [
    `Hi Vallari, I have booked a ${result.packageName} appointment.`,
    ``,
    `Date: ${result.dateLabel}`,
    `Time: ${result.timeLabel}`,
    `Name: ${result.name}`,
    `Mobile: ${result.mobile}`,
    `Email: ${result.email}`,
    `Booking fee paid: ${formatRupees(result.amountPaise)}`
  ].join("\n");

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
        <div>
          <span className="label">Booking fee paid</span>
          <span>{formatRupees(result.amountPaise)}</span>
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
