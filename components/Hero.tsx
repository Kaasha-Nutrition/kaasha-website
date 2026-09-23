"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Slide {
  src: string;
  alt: string;
}

const SLIDES: Slide[] = [
  {
    src: "/images/mainslider-1.jpg",
    alt: "Woman in activewear drinking fruit-infused water from a glass bottle"
  },
  {
    src: "/images/mainslider-2.jpg",
    alt: "Woman in a bright kitchen eating a bowl of yoghurt with strawberries, fresh fruit in the background"
  },
  {
    src: "/images/mainslider-3.jpg",
    alt: "A man and woman running together on a pedestrian bridge"
  },
  {
    src: "/images/hero-slide-noodle-bowls.jpg",
    alt: "A vegetable noodle broth bowl and a rice bowl with soft-boiled egg, flat-lay"
  },
  {
    src: "/images/hero-slide-oat-fruit-bowl.jpg",
    alt: "An oat bowl topped with sliced apple, blueberries and almonds, plated on a wooden board"
  },
  {
    src: "/images/hero-slide-citrus-slices.jpg",
    alt: "Sliced grapefruit, kiwi, orange and pomegranate seeds, flat-lay"
  }
];

const AUTOPLAY_MS = 5500;

export default function Hero() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function goTo(i: number) {
    setActive(i);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((cur) => (cur + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
  }

  return (
    <section className="hero">
      <div className="hero-bg">
        {SLIDES.map((slide, i) => (
          <div key={slide.src} className={`hero-slide${i === active ? " active" : ""}`} aria-hidden={i !== active}>
            <Image src={slide.src} alt={slide.alt} fill sizes="100vw" priority={i === 0} />
          </div>
        ))}
      </div>

      <div className="wrap">
        <div className="hero-content">
          <span className="eyebrow">Lifestyle &amp; Sports Nutrition</span>
          <h1>
            Eat right and the pants
            <br />
            <em>won&apos;t</em> be tight.
          </h1>
          <span className="hero-tagline-cite">— Anonymous</span>
          <p className="hero-sub">
            Vallari Shah builds personalised nutrition plans around your body, your training and your
            schedule — clinical where it needs to be, livable every day.
          </p>
          <div className="hero-ctas">
            <a className="btn btn-primary" href="/services">
              Explore Services
            </a>
          </div>
        </div>
      </div>

      <div className="hero-dots" role="tablist" aria-label="Hero slides">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            role="tab"
            aria-selected={i === active}
            aria-label={`Show slide ${i + 1} of ${SLIDES.length}`}
            className={i === active ? "active" : ""}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  );
}
