import { useId, useState } from 'react'
import { readLogoFile } from '../utils/logo.js'
import './Field.css'
import './LogoField.css'

export default function LogoField({ logo, onChange }) {
  const inputId = useId()
  const [error, setError] = useState('')

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      onChange(await readLogoFile(file))
      setError('')
    } catch {
      setError('Use a PNG, JPG, or WEBP image.')
    }
  }

  return (
    <div className="field">
      <span id={`${inputId}-label`}>Logo</span>
      <div className="logo-row">
        {logo ? <img className="logo-thumb" src={logo} alt="" /> : null}
        <label className="btn btn-white pressable logo-pick" htmlFor={inputId}>
          {logo ? 'Replace logo' : 'Add logo'}
        </label>
        <input id={inputId} className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp,image/gif" aria-labelledby={`${inputId}-label`} onChange={handleFile} />
        {logo ? (
          <button type="button" className="btn btn-white pressable" onClick={() => onChange('')}>
            Remove
          </button>
        ) : null}
      </div>
      <p className="field-hint">Sits in the center. Q or H error correction keeps the code scannable.</p>
      <p className="field-error" aria-live="polite">
        {error}
      </p>
    </div>
  )
}
