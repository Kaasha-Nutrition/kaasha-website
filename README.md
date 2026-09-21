# Kaasha by Vallari Shah — Next.js site

This is the React / Next.js 15 (App Router, TypeScript) conversion of the single-file HTML build. Same design, same content, same booking flow — now as a proper component-based project you can extend, connect to a real form backend, or deploy on Vercel.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. For a production build:

```bash
npm run build
npm start
```

## Project structure

```
app/
  layout.tsx       Root layout — fonts, metadata, wraps the page in BookingProvider
  page.tsx          Assembles all sections for the one-page site
  globals.css        All design tokens (CSS variables) and section styles, ported 1:1 from the original build
components/
  Header.tsx          Sticky nav + mobile menu (client component)
  Hero.tsx            Full-bleed split hero
  About.tsx           Vallari's bio, credentials, photo composition
  Services.tsx        11 services + 3 "coming soon", with category filters (client component)
  Sports.tsx           Full-bleed Sports Nutrition section
  Why.tsx              "Why Kaasha" philosophy cards + photo band
  Blog.tsx             20-post blog grid with category filters (client component)
  Contact.tsx           Booking form -> WhatsApp / email (client component)
  Closing.tsx          Closing CTA band
  Footer.tsx           Footer + logo plate
  WhatsAppFloat.tsx    Floating WhatsApp button
  Reveal.tsx            Scroll-reveal wrapper (IntersectionObserver), replaces the old vanilla-JS version
  icons.tsx              Shared inline SVG icon components
lib/
  data.ts                SERVICES and POSTS content arrays — edit these to add/change services, prices, or blog posts
  booking-context.tsx    React context that lets a "Book Now" button on any card preset the Contact form's service dropdown and scroll to it
public/images/           All site photography + the official Kaasha logo (unchanged, used as-is)
```

## Editing content

- **Services, prices, durations, descriptions, card images** — edit the `SERVICES` array in `lib/data.ts`.
- **Blog posts** — edit the `POSTS` array in `lib/data.ts`. Posts currently link out to the original Wix blog (`ORIGINAL_BLOG_URL`) until each article's full text is migrated into this site.
- **Copy in each section** (hero headline, About bio, Why Kaasha cards, contact details) — edit directly in the matching file under `components/`.
- **Colors, fonts, spacing** — all defined as CSS custom properties at the top of `app/globals.css` (`:root { --blue-600, --green-600, --paper, ... }`). A dark-mode palette is already wired up via `prefers-color-scheme`.

## Booking flow

The Contact form builds a plain-text inquiry message and hands it off to:
- **WhatsApp** — `https://wa.me/917769090258?text=...` (click-to-chat, no API key needed)
- **Email** — a `mailto:vallari@kaasha.in` link

There's no backend yet — nothing is stored or emailed automatically. If you want submitted inquiries to land in an inbox or database without the visitor's own WhatsApp/email client opening, wire the `handleWhatsapp` / `handleEmail` functions in `components/Contact.tsx` to a form service (e.g. Formspree, Resend, EmailJS) or your own API route under `app/api/`.

## Images

All photography and the logo live in `public/images/` and are served through `next/image` for automatic resizing, lazy-loading and modern formats (WebP/AVIF). Swap a file in place (same filename) to replace a photo without touching any component code, or add a new file and reference it from `lib/data.ts` / the relevant component.

## Known housekeeping

- `npm audit` reports a couple of advisories in Next.js's own build-time `postcss` dependency (not a runtime/browser exposure for this static-ish site). Run `npm audit fix` periodically, or upgrade to the latest Next.js 15.x patch release when convenient.
- Google Fonts (Sora + Work Sans) are loaded via a `<link>` tag in `app/layout.tsx`, matching the original build. This was a deliberate choice for this sandbox (which can't reach `fonts.googleapis.com` to verify a build), but on your own machine or on Vercel you can switch to `next/font/google` for self-hosted, render-blocking-free fonts: import `Sora`/`Work_Sans` from `next/font/google` in `app/layout.tsx`, apply their `.variable` classes to `<html>`, and change `--serif`/`--sans` in `app/globals.css` to `var(--font-sora)` / `var(--font-work-sans)`.
- No analytics, sitemap.xml, or robots.txt are wired up yet — add these before going live.
