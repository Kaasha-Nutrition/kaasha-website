/**
 * The rotating "stamp" badge used in the corner of Vallari's About portrait:
 * a solid backing disc, two dashed rings, and "Lifestyle & Sports /
 * Nutritionist" set on curved paths in the band between them.
 */
export default function RingBadge() {
  return (
    <svg className="ring-badge" viewBox="0 0 220 220" aria-hidden="true">
      <defs>
        <path id="ringBadgeTop" d="M 34,110 A 76,76 0 0 1 186,110" />
        <path id="ringBadgeBottom" d="M 34,110 A 76,76 0 0 0 186,110" />
      </defs>

      <circle className="badge-bg" cx="110" cy="110" r="102" />
      <circle className="badge-ring-outer" cx="110" cy="110" r="96" />
      <circle className="badge-ring-inner" cx="110" cy="110" r="54" />

      <text className="badge-text">
        <textPath href="#ringBadgeTop" startOffset="50%" textAnchor="middle">
          Lifestyle &amp; Sports
        </textPath>
      </text>
      <text className="badge-text">
        <textPath href="#ringBadgeBottom" startOffset="50%" textAnchor="middle">
          Nutritionist
        </textPath>
      </text>

      <circle className="badge-seam" cx="34" cy="110" r="3" />
      <circle className="badge-seam" cx="186" cy="110" r="3" />
    </svg>
  );
}
