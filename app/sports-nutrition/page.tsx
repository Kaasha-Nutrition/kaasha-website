import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Reveal from "@/components/Reveal";
import Sports from "@/components/Sports";

const TITLE = "Sports Nutrition — Kaasha by Vallari Shah";
const DESCRIPTION =
  "One-on-one sports nutrition coaching with Vallari Shah in Vadodara — training-day diets, hydration strategy, fatigue reduction and competition-prep nutrition for runners, triathletes and team-sport athletes.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://kaasha.in/sports-nutrition" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://kaasha.in/sports-nutrition",
    images: [{ url: "/images/topic-pilates.jpg" }]
  }
};

export default function SportsNutritionPage() {
  return (
    <>
      <Header />
      <main id="top">
        <section className="page-banner">
          <div className="page-banner-bg">
            <Image src="/images/topic-pilates.jpg" alt="Athlete training session" fill sizes="100vw" priority />
          </div>
          <div className="wrap">
            <Link href="/" className="post-back">
              ← Back to Home
            </Link>
            <span className="eyebrow">Sports Nutrition</span>
            <h1>Fuel training. Fuel recovery. Fuel race day.</h1>
          </div>
        </section>

        <Sports />

        <article className="post-article">
          <div className="wrap post-article-cta">
            <Reveal as="div" className="post-cta-band">
              <div>
                <span className="eyebrow">Ready to get started?</span>
                <h3>Book a one-on-one sports nutrition consultation with Vallari.</h3>
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
