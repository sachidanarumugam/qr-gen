import { Fragment } from 'react'
import './Hero.css'

// Each word is its own span so the intro can stagger them with --i. The space between words
// sits outside the inline-block spans, because a trailing space inside one collapses.
function Words({ text, start }) {
  return text.split(' ').map((word, index) => (
    <Fragment key={word + index}>
      {index > 0 && ' '}
      <span className="word" style={{ '--i': start + index }}>
        {word}
      </span>
    </Fragment>
  ))
}

export default function Hero() {
  return (
    <div className="hero">
      <h1 className="headline">
        <span className="headline-line">
          <Words text="Free QR codes." start={0} />
        </span>
        <span className="headline-line">
          <span className="pop">
            <Words text="No cap." start={3} />
          </span>
        </span>
      </h1>
      <p className="subtitle">Type something, hit generate, download a PNG. Nothing leaves your browser.</p>
    </div>
  )
}
