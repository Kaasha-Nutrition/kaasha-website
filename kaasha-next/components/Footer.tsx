import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="logo-plate">
              <Image src="/images/logo.png" alt="Kaasha by Vallari Shah" width={1021} height={400} />
            </div>
            <p>Vallari Shah — Lifestyle &amp; Sports Nutritionist.</p>
          </div>
          <div>
            <h4>Site</h4>
            <ul>
              <li><a href="/#about">About</a></li>
              <li><a href="/services">Services</a></li>
              <li><a href="/#sports">Sports Nutrition</a></li>
              <li><a href="/#blog">Blog &amp; Recipes</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:vallari@kaasha.in">vallari@kaasha.in</a></li>
              <li><a href="tel:+917769090258">+91 77690 90258</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/#contact">Book a Consultation</a></li>
            </ul>
          </div>
          <div>
            <h4>Follow</h4>
            <ul>
              <li><a href="https://www.facebook.com/kaashabyvallarishah" target="_blank" rel="noopener">Facebook</a></li>
              <li><a href="https://www.instagram.com/kaashabyvallarishah/" target="_blank" rel="noopener">Instagram</a></li>
              <li><a href="https://in.pinterest.com/beautyspa11/" target="_blank" rel="noopener">Pinterest</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {year} Kaasha by Vallari Shah. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
