"use client";

import Reveal from "./Reveal";
import BookingSlotPicker from "./BookingSlotPicker";
import { MailIcon, PhoneIcon, PinIcon, ClockIcon, TagIcon, FacebookIcon, InstagramIcon, PinterestIcon } from "./icons";
import { SERVICES, CAT_LABEL } from "@/lib/data";
import { useBooking } from "@/lib/booking-context";
import { PRACTICE_ADDRESS } from "@/lib/contact-info";

const BOOKABLE = SERVICES.filter((s) => s.cat !== "soon");

export default function Contact() {
  const { selectedService } = useBooking();
  const selected = BOOKABLE.find((s) => s.name === selectedService) ?? null;

  return (
    <section id="contact">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">Book a Consultation</span>
          <h2>Tell Vallari what you need — she&apos;ll take it from there.</h2>
          <p>Pick a service and your preferred date &amp; time, then send it straight to WhatsApp or email. Vallari will confirm availability directly with you.</p>
        </Reveal>

        <div className="booking-shell">
          <BookingSlotPicker />

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
