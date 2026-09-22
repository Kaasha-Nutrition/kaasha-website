import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ServicesGrid from "@/components/ServicesGrid";

export const metadata: Metadata = {
  title: "Services — Kaasha by Vallari Shah",
  description:
    "Eleven one-on-one nutrition services with Vallari Shah — sports nutrition, clinical and lifestyle programs — priced individually with no bundled packages."
};

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main id="top">
        <section className="page-banner">
          <div className="page-banner-bg">
            <Image src="/images/food-chef-prep.jpg" alt="" fill sizes="100vw" priority />
          </div>
          <div className="wrap">
            <Link href="/" className="post-back">
              ← Back to Home
            </Link>
            <span className="eyebrow">Services</span>
            <h1>Eleven ways to work together.</h1>
          </div>
        </section>

        <article className="post-article">
          <ServicesGrid />
        </article>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
