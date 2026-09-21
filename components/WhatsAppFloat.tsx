import { WhatsappIcon } from "./icons";

export default function WhatsAppFloat() {
  return (
    <a
      className="wa-float"
      href="https://wa.me/917769090258?text=Hi%20Vallari%2C%20I%27d%20like%20to%20know%20more%20about%20your%20nutrition%20programs."
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
    >
      <WhatsappIcon width={27} height={27} />
    </a>
  );
}
