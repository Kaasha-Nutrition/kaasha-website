import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import MarqueeTicker from "@/components/MarqueeTicker";
import ServicesTeaser from "@/components/ServicesTeaser";
import Sports from "@/components/Sports";
import Why from "@/components/Why";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import Closing from "@/components/Closing";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Kaasha by Vallari Shah — Lifestyle & Sports Nutritionist in Vadodara",
  description:
    "Personalised lifestyle and sports nutrition with Vallari Shah — a Vadodara-based nutritionist and dietitian offering diabetes, PCOD, weight management, pregnancy and sports nutrition consultations.",
  alternates: { canonical: "https://www.kaasha.in/" }
};

export default function Home() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <About />
        <MarqueeTicker />
        <ServicesTeaser />
        <Sports />
        <Why />
        <Blog />
        <Contact />
        <Closing />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
