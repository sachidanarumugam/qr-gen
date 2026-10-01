import './Section.css'

// The id ties the heading to the section so screen readers announce its name.
export default function Section({ number, title, id, children }) {
  const headingId = `${id}-heading`

  return (
    <section className="section" aria-labelledby={headingId}>
      <h2 className="section-title" id={headingId}>
        <span className="mono">{number}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}
