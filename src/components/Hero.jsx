import './Hero.css'

// Each word is its own span so the intro can stagger them with --i.
function Words({ text, start }) {
  return text.split(' ').map((word, index) => (
    <span className="word" style={{ '--i': start + index }} key={word + index}>
      {word}{' '}
    </span>
  ))
}

export default function Hero() {
  return (
    <div className="hero">
      <h1 className="headline">
        <span className="headline-line">
          <Words text="Make a QR." start={0} />
        </span>
        <span className="headline-line">
          <span className="pop">
            <Words text="Make it pop." start={3} />
          </span>
        </span>
      </h1>
      <p className="subtitle">Type something, hit generate, download a PNG. Nothing leaves your browser.</p>
    </div>
  )
}
