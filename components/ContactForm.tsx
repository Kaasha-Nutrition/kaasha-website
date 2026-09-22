"use client";

import { useState, type FormEvent } from "react";
import { WhatsappIcon } from "./icons";
import { EMAIL, PHONE_WA } from "@/lib/contact-info";

/**
 * General-inquiry form for the dedicated /contact page — simpler than the
 * package-booking form on the homepage (no service/date/time selection).
 * There is no backend, so submissions hand the message off to WhatsApp or
 * email, matching the pattern already used by the booking flow.
 */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  function buildMessage(): string | null {
    if (!name.trim() || !message.trim()) {
      alert("Please fill in your name and message.");
      return null;
    }
    return [
      "New Website Inquiry",
      "Name: " + name.trim(),
      "Phone: " + (mobile.trim() || "—"),
      "Email: " + (email.trim() || "—"),
      "Subject: " + (subject.trim() || "—"),
      "Message: " + message.trim()
    ].join("\n");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  function handleWhatsapp() {
    const msg = buildMessage();
    if (!msg) return;
    window.open(`https://wa.me/${PHONE_WA}?text=` + encodeURIComponent(msg), "_blank");
    setShowConfirm(true);
  }

  function handleEmail() {
    const msg = buildMessage();
    if (!msg) return;
    const mailSubject = subject.trim() || "New website inquiry";
    window.location.href = `mailto:${EMAIL}?subject=` + encodeURIComponent(mailSubject) + "&body=" + encodeURIComponent(msg);
    setShowConfirm(true);
  }

  return (
    <form className="booking-panel" onSubmit={handleSubmit} noValidate>
      <div className="booking-panel-head">
        <h3>Send a message</h3>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="c-name">Full name *</label>
          <input id="c-name" name="name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="c-mobile">Mobile number</label>
          <input id="c-mobile" name="mobile" type="tel" autoComplete="tel" placeholder="+91" value={mobile} onChange={(e) => setMobile(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-email">Email</label>
        <input id="c-email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="c-subject">Subject</label>
        <input id="c-subject" name="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="c-message">Message *</label>
        <textarea
          id="c-message"
          name="message"
          required
          placeholder="How can Vallari help?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <p className="required-note">* required fields</p>

      <div className="form-actions">
        <button type="button" className="btn btn-whatsapp" onClick={handleWhatsapp}>
          <WhatsappIcon width={17} height={17} />
          Send via WhatsApp
        </button>
        <button type="button" className="btn btn-ghost" onClick={handleEmail}>
          Send via Email
        </button>
      </div>
      <div className={`confirm-box${showConfirm ? " show" : ""}`}>
        Thanks — your message is ready to send. If your app didn&apos;t open automatically, use the buttons above again.
      </div>
    </form>
  );
}
