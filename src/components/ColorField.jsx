import { useId, useState } from 'react'
import { normalizeHex } from '../utils/settings.js'
import './Field.css'
import './ColorField.css'

const HEX_ERROR = 'Enter a color as #RGB or #RRGGBB, for example #1a73e8'

export default function ColorField({ label, value, onChange }) {
  const pickerId = useId()
  const textId = useId()
  const errorId = useId()
  // Text being typed in the hex box. null means "show the stored color".
  const [draft, setDraft] = useState(null)
  const error = draft !== null && normalizeHex(draft) === null ? HEX_ERROR : ''

  function handlePicker(event) {
    setDraft(null)
    onChange(event.target.value)
  }

  // An invalid value is never committed, so the preview keeps the last valid color.
  function handleText(event) {
    const text = event.target.value
    setDraft(text)
    const hex = normalizeHex(text)
    if (hex) onChange(hex)
  }

  function handleBlur() {
    if (draft !== null && normalizeHex(draft) !== null) setDraft(null)
  }

  return (
    <div className="field">
      <label htmlFor={textId}>{label}</label>
      <div className="color-row">
        <label className="visually-hidden" htmlFor={pickerId}>
          {label} picker
        </label>
        <input id={pickerId} className="swatch" type="color" value={value} onChange={handlePicker} />
        <input
          id={textId}
          className="control mono"
          type="text"
          value={draft ?? value}
          maxLength={7}
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          onChange={handleText}
          onBlur={handleBlur}
        />
      </div>
      <p className="field-error" id={errorId} aria-live="polite">
        {error}
      </p>
    </div>
  )
}
