import type { Metadata } from "next";
import { BookingProvider } from "@/lib/booking-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kaasha by Vallari Shah — Lifestyle & Sports Nutrition",
  description:
    "Personalised lifestyle and sports nutrition programs by Vallari Shah, based in Porvorim, Goa. Clinical nutrition, sports performance plans, and one-on-one consultations.",
  metadataBase: new URL("https://kaasha.in")
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
      </head>
      <body>
        <BookingProvider>{children}</BookingProvider>
      </body>
    </html>
  );
}
