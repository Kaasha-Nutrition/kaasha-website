"use client";

import { useState, type FormEvent } from "react";
import Reveal from "./Reveal";
import { MailIcon, PhoneIcon, PinIcon, ClockIcon, TagIcon, FacebookIcon, InstagramIcon, PinterestIcon, WhatsappIcon } from "./icons";
import { SERVICES, CAT_LABEL } from "@/lib/data";
import { useBooking } from "@/lib/booking-context";
import { PRACTICE_ADDRESS } from "@/lib/contact-info";

const BOOKABLE = SERVICES.filter((s) => s.cat !== "soon");

export default function Contact() {
  const { selectedService, setSelectedService } = useBooking();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const selected = BOOKABLE.find((s) => s.name === selectedService) ?? null;

  function buildMessage(): string | null {
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
      "Preferred Date: " + (date || "—"),
      "Preferred Time: " + (time || "—"),
      "Message/Goal: " + (message.trim() || "—")
    ].join("\n");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  function handleWhatsapp() {
    const msg = buildMessage();
    if (!msg) return;
    window.open("https://wa.me/917769090258?text=" + encodeURIComponent(msg), "_blank");
    setShowConfirm(true);
  }

  function handleEmail() {
    const msg = buildMessage();
    if (!msg) return;
    const subject = "New Package Inquiry — " + selectedService;
    window.location.href = "mailto:vallari@kaasha.in?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(msg);
    setShowConfirm(true);
  }

  return (
    <section id="contact">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">Book a Consultation</span>
          <h2>Tell Vallari what you need — she&apos;ll take it from there.</h2>
          <p>Pick a service and your preferred date &amp; time, then send it straight to WhatsApp or email. Vallari will confirm availability directly with you.</p>
        </Reveal>

        <div className="booking-shell">
          <Reveal as="form" className="booking-panel" id="bookingForm" onSubmit={handleSubmit} noValidate>
            <div className="booking-panel-head">
              <h3>Select a service, date &amp; time</h3>
              <span className="tz-badge">India Standard Time (IST)</span>
            </div>

            <div className="field">
              <label htmlFor="f-service">Service *</label>
              <select id="f-service" name="service" required value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                <option value="">Choose a service…</option>
                {BOOKABLE.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} — ₹{s.price!.toLocaleString("en-IN")} / {s.duration}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="f-date">Preferred date</label>
                <input id="f-date" name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="f-time">Preferred time</label>
                <input id="f-time" name="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>

            <p className="note-box">
              This isn&apos;t a live calendar — pick what works for you and Vallari will confirm the exact slot with you directly over WhatsApp or email.
            </p>

            <div className="panel-divider" />

            <h4 className="panel-subhead">Your details</h4>

            <div className="field-row">
              <div className="field">
                <label htmlFor="f-name">Full name *</label>
                <input id="f-name" name="name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="f-mobile">Mobile number *</label>
                <input id="f-mobile" name="mobile" type="tel" required autoComplete="tel" placeholder="+91" value={mobile} onChange={(e) => setMobile(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="f-email">Email *</label>
              <input id="f-email" name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="f-message">Message / goal</label>
              <textarea id="f-message" name="message" placeholder="Tell Vallari a bit about your goal…" value={message} onChange={(e) => setMessage(e.target.value)} />
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
              Thanks — your details are ready. If your app didn&apos;t open automatically, use the buttons above again.
            </div>
          </Reveal>

          <Reveal delay={1} className="booking-side">
            <div className="service-card">
              <span className="eyebrow-sm">Service Details</span>
              {selected ? (
                <>
                  <h4>{selected.name}</h4>
                  <div className="svc-price">₹{selected.price!.toLocaleString("en-IN")}</div>
                  <ul className="svc-meta">
                    <li>
                      <ClockIcon /> {selected.duration}
                    </li>
                    <li>
                      <TagIcon /> {CAT_LABEL[selected.cat]}
                    </li>
                    <li>
                      <PinIcon /> Chogm Road, Porvorim, Goa
                    </li>
                  </ul>
                </>
              ) : (
                <p className="svc-empty">Choose a service on the left to see its price, duration and location here.</p>
              )}
            </div>

            <div className="info-card">
              <h3>Direct contact</h3>
              <div className="info-row">
                <MailIcon />
                <div>
                  <span className="label">Email</span>
                  <a href="mailto:vallari@kaasha.in">vallari@kaasha.in</a>
                </div>
              </div>
              <div className="info-row">
                <PhoneIcon />
                <div>
                  <span className="label">Phone / WhatsApp</span>
                  <a href="tel:+917769090258">+91 77690 90258</a>
                </div>
              </div>
              <div className="info-row">
                <PinIcon />
                <div>
                  <span className="label">Practice address</span>
                  <span>{PRACTICE_ADDRESS}</span>
                </div>
              </div>
              <div className="social-row">
                <a href="https://www.facebook.com/kaashabyvallarishah" target="_blank" rel="noopener" aria-label="Facebook">
                  <FacebookIcon />
                </a>
                <a href="https://www.instagram.com/kaashabyvallarishah/" target="_blank" rel="noopener" aria-label="Instagram">
                  <InstagramIcon />
                </a>
                <a href="https://in.pinterest.com/beautyspa11/" target="_blank" rel="noopener" aria-label="Pinterest">
                  <PinterestIcon />
                </a>
              </div>
              <p className="cancel-note">Please give at least 24 hours&apos; notice to reschedule or cancel a session.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
