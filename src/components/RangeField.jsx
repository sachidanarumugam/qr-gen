import { useId, useState } from 'react'
import { clampInt, parseIntInRange } from '../utils/settings.js'
import './Field.css'
import './RangeField.css'

export default function RangeField({ label, unit, value, limits, onChange }) {
  const sliderId = useId()
  const numberId = useId()
  // Text being typed in the number box. null means "show the stored value".
  const [draft, setDraft] = useState(null)

  function handleSlider(event) {
    setDraft(null)
    onChange(Number(event.target.value))
  }

  function handleNumber(event) {
    const text = event.target.value
    setDraft(text)
    const parsed = parseIntInRange(text, limits)
    if (parsed !== null) onChange(parsed)
  }

  function handleBlur() {
    if (draft === null) return
    onChange(clampInt(draft, limits, value))
    setDraft(null)
  }

  return (
    <div className="field">
      <label htmlFor={sliderId}>{label}</label>
      <div className="range-row">
        <input
          id={sliderId}
          className="range"
          type="range"
          min={limits.min}
          max={limits.max}
          step={1}
          value={value}
          onChange={handleSlider}
        />
        <label className="visually-hidden" htmlFor={numberId}>
          {label} as a number
        </label>
        <input
          id={numberId}
          className="control range-number"
          type="number"
          inputMode="numeric"
          min={limits.min}
          max={limits.max}
          step={1}
          value={draft ?? value}
          onChange={handleNumber}
          onBlur={handleBlur}
        />
      </div>
      <p className="field-hint">
        {limits.min} to {limits.max} {unit}
      </p>
    </div>
  )
}
