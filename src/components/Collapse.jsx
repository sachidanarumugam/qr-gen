import './Collapse.css'

// Height animation without measuring: a one-row grid goes from 0fr to 1fr.
// `inert` keeps hidden fields out of the tab order and the accessibility tree.
export default function Collapse({ open, children }) {
  return (
    <div className={open ? 'collapse is-open' : 'collapse'} inert={!open}>
      <div className="collapse-inner">{children}</div>
    </div>
  )
}
