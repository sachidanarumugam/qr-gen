import { useId } from 'react'
import './Field.css'

export default function TextField({ label, value, onChange, multiline = false, hint, ...inputProps }) {
  const id = useId()
  const hintId = `${id}-hint`
  const Control = multiline ? 'textarea' : 'input'

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Control
        id={id}
        className="control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={hint ? hintId : undefined}
        {...inputProps}
      />
      {hint && (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      )}
    </div>
  )
}
