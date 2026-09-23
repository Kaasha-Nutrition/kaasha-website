import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { BalanceIcon, LeafIcon, TargetIcon } from "./icons";

const CARDS = [
  {
    n: "01",
    tone: "blue",
    icon: BalanceIcon,
    title: "No Good Foods. No Bad Foods.",
    body: "Just foods that work better for you than others. Nothing is off-limits by default — every plan starts from what you already eat, not a list of what to give up."
  },
  {
    n: "02",
    tone: "green",
    icon: TargetIcon,
    title: "Personalised, Not Generic",
    body: "Every plan begins with a real assessment of your lifestyle, blood work and body composition — then a meal plan built around your preferences and routine, reviewed every few weeks."
  },
  {
    n: "03",
    tone: "blue",
    icon: LeafIcon,
    title: "Sustainable, Not Restrictive",
    body: "“Deprivation is not part of my vocabulary.” The goal is a way of eating you can keep living with — not a plan you're counting down the days to finish."
  }
];

export default function Why() {
  return (
    <section className="why">
      <div className="blob" style={{ width: 360, height: 360, background: "var(--blue-500)", bottom: -100, right: -120 }} />
      <div className="wrap">
        <Reveal as="div" className="sec-head center" style={{ marginInline: "auto" }}>
          <span className="eyebrow">Why Kaasha</span>
          <h2>A philosophy, not a diet plan.</h2>
        </Reveal>
        <div className="why-grid">
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.n} className="why-card" delay={i === 0 ? undefined : (i as 1 | 2)}>
                <div className="why-card-top">
                  <span className={`why-icon tone-${c.tone}`}>
                    <Icon />
                  </span>
                  <span className="why-num">{c.n}</span>
                </div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="why-feature">
          <div className="why-feature-media">
            <Image
              src="/images/vallari-cake.jpg"
              alt="Vallari Shah happily enjoying a slice of cake"
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
              style={{ objectFit: "cover", objectPosition: "50% 25%" }}
            />
          </div>
          <div className="why-feature-copy">
            <span className="eyebrow">Balance, Proven</span>
            <h3>Cake included. That&apos;s the whole point.</h3>
            <p>No rulebook, no forbidden list — just a way of eating built around your real life, including the parts worth celebrating.</p>
            <Link href="/about" className="btn btn-white">
              Read Vallari&apos;s Story
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
