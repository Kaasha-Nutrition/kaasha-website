import type { Metadata } from "next";
import { BookingProvider } from "@/lib/booking-context";
import { EMAIL, PHONE_TEL, SOCIALS } from "@/lib/contact-info";
import "./globals.css";

const SITE_URL = "https://kaasha.in";
const SITE_NAME = "Kaasha by Vallari Shah";
const SITE_TITLE = "Kaasha by Vallari Shah — Lifestyle & Sports Nutrition";
const SITE_DESCRIPTION =
  "Personalised lifestyle and sports nutrition programs by Vallari Shah. Clinical nutrition, sports performance plans, and one-on-one consultations.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png"
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_IN",
    images: [{ url: "/images/logo.png", width: 1021, height: 400, alt: "Kaasha by Vallari Shah logo" }]
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/logo.png"]
  }
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#business`,
      name: SITE_NAME,
      image: `${SITE_URL}/images/logo.png`,
      url: SITE_URL,
      telephone: PHONE_TEL,
      email: EMAIL,
      priceRange: "₹₹",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rhythm Medicity, Police Station, Gotri – Vasna Rd, Opposite GERI Compound, Near Gotri Road, Karmjyot Society, Gotri",
        addressLocality: "Vadodara",
        addressRegion: "Gujarat",
        postalCode: "390007",
        addressCountry: "IN"
      },
      sameAs: SOCIALS.map((s) => s.href)
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#vallari-shah`,
      name: "Vallari Shah",
      jobTitle: "Lifestyle & Sports Nutritionist",
      url: `${SITE_URL}/about`,
      image: `${SITE_URL}/images/vallari-headshot.jpg`,
      worksFor: { "@id": `${SITE_URL}/#business` },
      sameAs: SOCIALS.map((s) => s.href)
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#business` }
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Work+Sans:wght@300;400;500;600;700;800&display=swap"
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <BookingProvider>{children}</BookingProvider>
      </body>
    </html>
  );
}
