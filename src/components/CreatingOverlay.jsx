import './CreatingOverlay.css'

const SEGMENTS = Array.from({ length: 12 }, (_, index) => index)

export default function CreatingOverlay() {
  return (
    <div className="overlay creating" role="status" aria-live="polite">
      <div className="creating-card">
        <p className="creating-title">Creating...</p>
        <div className="progress" aria-hidden="true">
          {SEGMENTS.map((index) => (
            <span className="progress-segment" style={{ '--i': index }} key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
