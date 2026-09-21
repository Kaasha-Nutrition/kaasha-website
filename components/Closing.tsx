import Image from "next/image";

export default function Closing() {
  return (
    <section className="closing">
      <div className="closing-inner">
        <div className="closing-bg">
          <Image
            src="/images/vallari-beach.jpg"
            alt="Vallari Shah smiling outdoors"
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "50% 30%" }}
          />
        </div>
        <div className="wrap">
          <span className="eyebrow" style={{ color: "var(--green-500)" }}>
            Ready when you are
          </span>
          <h2>Ready to find your balance?</h2>
          <p>One conversation is usually enough to know if it&apos;s a fit. No pressure, no rigid rules — just a plan built around your life.</p>
          <div className="hero-ctas">
            <a className="btn btn-white" href="#contact">
              Book a Consultation
            </a>
            <a
              className="btn btn-outline-light"
              href="https://wa.me/917769090258?text=Hi%20Vallari%2C%20I%27d%20like%20to%20know%20more%20about%20your%20nutrition%20programs."
              target="_blank"
              rel="noopener"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
