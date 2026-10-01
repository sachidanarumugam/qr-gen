import { QR_TYPES } from '../utils/payloads.js'
import './TypeSelector.css'

export default function TypeSelector({ value, onChange }) {
  return (
    <fieldset className="type-selector">
      <legend>QR code type</legend>
      <div className="segments">
        {QR_TYPES.map((type) => (
          <label className="segment" key={type.id}>
            <input
              type="radio"
              name="qr-type"
              value={type.id}
              checked={value === type.id}
              onChange={() => onChange(type.id)}
            />
            <span className="segment-label">{type.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
