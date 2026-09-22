import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";
import { MailIcon, PhoneIcon, PinIcon, FacebookIcon, InstagramIcon, PinterestIcon } from "@/components/icons";
import { EMAIL, PHONE_DISPLAY, PHONE_TEL, PRACTICE_ADDRESS, SOCIALS } from "@/lib/contact-info";

export const metadata: Metadata = {
  title: "Contact — Kaasha by Vallari Shah",
  description:
    "Get in touch with Vallari Shah — Lifestyle & Sports Nutritionist — by phone, email or the contact form for questions, suggestions or to start your nutrition journey."
};

const SOCIAL_ICON = { Facebook: FacebookIcon, Instagram: InstagramIcon, Pinterest: PinterestIcon } as const;

export default function ContactPage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(PRACTICE_ADDRESS)}&output=embed`;

  return (
    <>
      <Header />
      <main id="top">
        <section className="page-banner">
          <div className="page-banner-bg">
            <Image src="/images/topic-journal.jpg" alt="" fill sizes="100vw" priority />
          </div>
          <div className="wrap">
            <Link href="/" className="post-back">
              ← Back to Home
            </Link>
            <span className="eyebrow">Contact</span>
            <h1>Get in touch with Vallari.</h1>
          </div>
        </section>

        <article className="post-article">
          <div className="wrap booking-shell">
            <Reveal as="div">
              <ContactForm />
            </Reveal>

            <Reveal delay={1} as="div" className="booking-side">
              <div className="info-card">
                <h3>Get in touch</h3>
                <p className="contact-intro-text">
                  If you need more information, have questions, or would like to offer a suggestion, please be in
                  touch. You can contact Vallari via phone, email or by filling out the form — she&apos;ll get back
                  to you as soon as possible.
                </p>
                <div className="info-row">
                  <MailIcon />
                  <div>
                    <span className="label">Email</span>
                    <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                  </div>
                </div>
                <div className="info-row">
                  <PhoneIcon />
                  <div>
                    <span className="label">Phone / WhatsApp</span>
                    <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
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
                  {SOCIALS.map((s) => {
                    const Icon = SOCIAL_ICON[s.name];
                    return (
                      <a key={s.name} href={s.href} target="_blank" rel="noopener" aria-label={s.name}>
                        <Icon />
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="map-embed">
                <iframe
                  src={mapSrc}
                  title="Kaasha by Vallari Shah — practice location"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
          </div>
        </article>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
