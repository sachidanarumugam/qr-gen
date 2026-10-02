import './Decor.css'

const BADGE_TEXT = 'FREE • NO SIGN-UP • STAYS IN YOUR BROWSER • '

// Purely decorative: hidden from assistive tech and never receives pointer events.
export default function Decor() {
  return (
    <div className="decor" aria-hidden="true">
      <svg className="shape shape-circle" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" strokeWidth="5" />
      </svg>
      <svg className="shape shape-square" viewBox="0 0 80 80">
        <rect x="6" y="6" width="68" height="68" strokeWidth="5" />
      </svg>
      <svg className="shape shape-plus" viewBox="0 0 80 80">
        <path
          d="M30 6h20v24h24v20H50v24H30V50H6V30h24z"
          strokeWidth="4"
          strokeLinejoin="miter"
        />
      </svg>
      <svg className="shape shape-star" viewBox="0 0 80 80">
        <path
          d="M40 4l10.5 24.5L77 31l-20 17.5L63 75 40 61 17 75l6-26.5L3 31l26.5-2.5z"
          strokeWidth="5"
          strokeLinejoin="miter"
        />
      </svg>
      <svg className="shape shape-square-small" viewBox="0 0 80 80">
        <rect x="6" y="6" width="68" height="68" strokeWidth="6" />
      </svg>
      <div className="badge">
        <svg viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="76" strokeWidth="5" />
          <g className="badge-ring">
            <defs>
              <path id="badge-path" d="M80 80m-56 0a56 56 0 1 1 112 0a56 56 0 1 1-112 0" />
            </defs>
            <text fontSize="14" fontWeight="800" textLength="346" lengthAdjust="spacing">
              <textPath href="#badge-path">{BADGE_TEXT}</textPath>
            </text>
          </g>
          <text x="80" y="92" textAnchor="middle" fontSize="34" fontWeight="800" letterSpacing="-2">
            QR
          </text>
        </svg>
      </div>
    </div>
  )
}
