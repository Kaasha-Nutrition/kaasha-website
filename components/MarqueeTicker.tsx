import { SPECIALTIES } from "@/lib/about-content";

/**
 * Continuously scrolling band of Vallari's actual specialty areas (the same
 * list already shown as chips in the About section), separated by
 * asterisks. Purely decorative and duplicated for a seamless CSS loop, so
 * it's marked aria-hidden — the same information is already readable
 * elsewhere on the page.
 */
const WORDS = ["Sports Nutrition", "Lifestyle Nutrition", ...SPECIALTIES];

export default function MarqueeTicker() {
  return (
    <div className="marquee-ticker" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((rep) => (
          <div className="marquee-group" key={rep}>
            {WORDS.map((w, i) => (
              <span className="marquee-item" key={`${rep}-${i}`}>
                {w}
                <span className="marquee-dot">✳</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
