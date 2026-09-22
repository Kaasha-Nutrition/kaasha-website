import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { CheckIcon } from "./icons";
import { CREDENTIALS, SPECIALTIES } from "@/lib/about-content";

export default function About() {
  return (
    <section id="about" className="about">
      <div className="blob" style={{ width: 420, height: 420, background: "var(--green-500)", top: -120, left: -160 }} />
      <div className="wrap about-grid">
        <Reveal className="about-art">
          <div className="ring" />
          <div className="main">
            <Image src="/images/vallari-about-portrait.jpg" alt="Vallari Shah, Lifestyle & Sports Nutritionist" width={1200} height={1800} priority />
          </div>
          <div className="float">
            <Image src="/images/food-greens-flatlay.jpg" alt="Fresh greens flat-lay" width={400} height={400} />
          </div>
        </Reveal>
        <Reveal delay={1}>
          <span className="eyebrow">Meet Vallari</span>
          <h2>A lifestyle &amp; sports nutritionist who treats food as medicine.</h2>
          <p style={{ marginTop: 18, fontSize: 16 }}>
            Vallari is dedicated to helping people use food as medicine — healing from the root cause
            rather than chasing quick fixes. She holds a Bachelor&apos;s degree in Applied Nutrition and a
            Diploma in Cosmetology, trained at Harvard University to sharpen her clinical skill, and
            studied at the Institute for Integrative Nutrition. Before opening her own practice, she spent
            several years working in a clinical environment.
          </p>
          <blockquote className="pull">&ldquo;Deprivation is not part of my vocabulary.&rdquo;</blockquote>
          <ul className="credentials">
            {CREDENTIALS.map((c) => (
              <li key={c}>
                <CheckIcon /> {c}
              </li>
            ))}
          </ul>
          <div className="chips">
            {SPECIALTIES.map((c) => (
              <span className="chip" key={c}>
                {c}
              </span>
            ))}
          </div>
          <Link href="/about" className="btn btn-ghost read-more-btn">
            Read More About Vallari
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
