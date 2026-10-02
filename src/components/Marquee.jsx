import './Marquee.css'

const WORDS = ['Free', 'No sign-up', 'Stays in your browser', 'PNG download', 'Any size']

// The list is rendered twice and the track slides by exactly half its width, so the loop has no seam.
export default function Marquee() {
  const run = WORDS.map((word) => (
    <span className="marquee-item" key={word}>
      {word}
      <span className="marquee-sep">★</span>
    </span>
  ))

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <div className="marquee-run">{run}</div>
        <div className="marquee-run">{run}</div>
      </div>
    </div>
  )
}
