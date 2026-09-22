"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/#sports", label: "Sports Nutrition" },
  { href: "/#blog", label: "Blog & Recipes" },
  { href: "/contact", label: "Contact" }
];

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);

  // Mirrors the original body.nav-open toggle so the existing CSS
  // (#mobileNav display rules) keeps working unmodified.
  useEffect(() => {
    document.body.classList.toggle("nav-open", navOpen);
    return () => document.body.classList.remove("nav-open");
  }, [navOpen]);

  return (
    <header className="site">
      <div className="wrap nav-row">
        <a className="brand" href="/" aria-label="Kaasha by Vallari Shah — home">
          <Image src="/images/logo.png" alt="Kaasha by Vallari Shah logo" width={1021} height={400} priority />
        </a>
        <nav className="primary" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <a className="btn btn-primary btn-sm" href="/#contact">
            Book a Consultation
          </a>
          <button
            className="hamburger"
            id="hamburgerBtn"
            aria-expanded={navOpen}
            aria-controls="mobileNav"
            aria-label="Open menu"
            onClick={() => setNavOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </div>
      <nav id="mobileNav" aria-label="Mobile" onClick={(e) => {
        if ((e.target as HTMLElement).tagName === "A") setNavOpen(false);
      }}>
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
        <a href="/#contact" style={{ color: "var(--blue-600)", fontWeight: 700 }}>
          Book a Consultation →
        </a>
      </nav>
    </header>
  );
}
