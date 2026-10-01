import { useId } from 'react'
import './SegmentedControl.css'

export default function SegmentedControl({ legend, options, value, onChange }) {
  // Radios in a group need a shared name; useId keeps two controls on one page apart.
  const name = useId()

  return (
    <fieldset className="segmented">
      <legend>{legend}</legend>
      <div className="segments">
        {options.map((option) => (
          <label className="segment" key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className="segment-label">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
