import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Sports from "@/components/Sports";
import Why from "@/components/Why";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import Closing from "@/components/Closing";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Home() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <About />
        <Services />
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
