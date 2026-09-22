import Link from "next/link";
import Reveal from "./Reveal";
import { NUTRITION_SERVICES_INTRO, NUTRITION_SERVICES_LIST } from "@/lib/data";

export default function ServicesTeaser() {
  return (
    <section id="services" className="services-teaser">
      <div className="blob" style={{ width: 300, height: 300, background: "var(--green-500)", top: -80, left: -110 }} />
      <div className="wrap svct-grid">
        <Reveal className="svct-intro">
          <span className="eyebrow">Nutrition Services</span>
          <h2>Personalised nutrition, for wherever you&apos;re starting from.</h2>
          <p>{NUTRITION_SERVICES_INTRO}</p>
          <Link className="btn btn-primary" href="/services">
            Explore All Services
          </Link>
        </Reveal>

        <Reveal delay={1} as="div" className="svct-list">
          {NUTRITION_SERVICES_LIST.map((name, i) => (
            <Link href="/services" className="svct-item" key={name}>
              <span className="svct-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="svct-name">{name}</span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
