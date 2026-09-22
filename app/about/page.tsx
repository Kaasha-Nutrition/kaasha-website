import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Reveal from "@/components/Reveal";
import RingBadge from "@/components/RingBadge";
import { CheckIcon } from "@/components/icons";
import { CREDENTIALS, SPECIALTIES, STORY } from "@/lib/about-content";

export const metadata: Metadata = {
  title: "About Vallari Shah — Kaasha by Vallari Shah",
  description:
    "Meet Vallari Shah, Lifestyle & Sports Nutritionist and founder of Kaasha — her story, her philosophy on food, and the credentials behind her practice."
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="top">
        <section className="page-banner">
          <div className="page-banner-bg">
            <Image src="/images/hero-greens-flatlay.jpg" alt="" fill sizes="100vw" priority />
          </div>
          <div className="wrap">
            <Link href="/#about" className="post-back">
              ← Back to Home
            </Link>
            <span className="eyebrow">About Vallari</span>
            <h1>The story behind Kaasha.</h1>
          </div>
        </section>

        <article className="post-article">
          <div className="wrap about-grid about-page-intro">
            <Reveal className="about-art">
              <RingBadge />
              <div className="main">
                <Image
                  src="/images/vallari-about-portrait.jpg"
                  alt="Vallari Shah, Lifestyle & Sports Nutritionist"
                  width={1200}
                  height={1800}
                  priority
                />
              </div>
              <div className="float">
                <Image src="/images/food-greens-flatlay.jpg" alt="Fresh greens flat-lay" width={400} height={400} />
              </div>
            </Reveal>
            <Reveal delay={1}>
              <span className="eyebrow">Specialties</span>
              <div className="chips">
                {SPECIALTIES.map((c) => (
                  <span className="chip" key={c}>
                    {c}
                  </span>
                ))}
              </div>
              <ul className="credentials">
                {CREDENTIALS.map((c) => (
                  <li key={c}>
                    <CheckIcon /> {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal as="div" className="wrap post-article-body about-story-body">
            {STORY.map((b, i) => {
              if (b.type === "p") return <p key={i}>{b.text}</p>;
              if (b.type === "h3") return <h3 key={i}>{b.text}</h3>;
              if (b.type === "quote") return <blockquote key={i}>{b.text}</blockquote>;
              if (b.type === "ul")
                return (
                  <ul key={i}>
                    {b.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              return (
                <ol key={i}>
                  {b.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ol>
              );
            })}
          </Reveal>

          <div className="wrap post-article-cta">
            <Reveal as="div" className="post-cta-band">
              <div>
                <span className="eyebrow">Ready to get started?</span>
                <h3>Book a one-on-one consultation with Vallari.</h3>
              </div>
              <Link className="btn btn-primary" href="/#contact">
                Book a Consultation
              </Link>
            </Reveal>
          </div>
        </article>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
