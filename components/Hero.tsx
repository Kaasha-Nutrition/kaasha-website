"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Slide {
  src: string;
  alt: string;
}

const SLIDES: Slide[] = [
  {
    src: "/images/hero-greens-flatlay.jpg",
    alt: "A flat-lay of fresh green vegetables and herbs — celery, green beans, spring onions, thyme, broad beans, bell peppers and snap peas"
  },
  {
    src: "/images/food-sweet-potato-wedges.jpg",
    alt: "Spiced roasted sweet potato wedges with a herbed yoghurt dip"
  },
  {
    src: "/images/food-watermelon-feta.jpg",
    alt: "A vibrant watermelon, tomato and feta salad"
  },
  {
    src: "/images/food-paneer-skewers.jpg",
    alt: "Grilled paneer skewers with a herb chimichurri — a high-protein plate"
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

  function prev() {
    goTo((active - 1 + SLIDES.length) % SLIDES.length);
  }

  function next() {
    goTo((active + 1) % SLIDES.length);
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

      <button className="hero-nav prev" onClick={prev} aria-label="Previous slide">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M15 18 9 12l6-6" />
        </svg>
      </button>
      <button className="hero-nav next" onClick={next} aria-label="Next slide">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div className="wrap">
        <div className="hero-content">
          <span className="eyebrow">Lifestyle &amp; Sports Nutrition · Porvorim, Goa</span>
          <h1>
            Food, done right
            <br />
            for how you
            <br />
            <em>actually</em> live.
          </h1>
          <p className="hero-sub">
            Vallari Shah builds personalised nutrition plans around your body, your training and your
            schedule — clinical where it needs to be, livable every day.
          </p>
          <div className="hero-ctas">
            <a className="btn btn-primary" href="#contact">
              Book a Consultation
            </a>
            <a className="btn btn-outline-light" href="#services">
              Explore Services
            </a>
          </div>
          <blockquote className="hero-quote">
            &ldquo;I don&apos;t believe in good or bad foods, just in foods that are better for you than
            others.&rdquo;
            <cite>— Vallari Shah</cite>
          </blockquote>
          <div className="hero-stats">
            <div>
              <b>11</b>
              <span>Programs</span>
            </div>
            <div>
              <b>20+</b>
              <span>Articles</span>
            </div>
            <div>
              <b>2</b>
              <span>Disciplines</span>
            </div>
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

      <span className="scroll-cue">
        <span className="line" />
        Scroll
      </span>
    </section>
  );
}
