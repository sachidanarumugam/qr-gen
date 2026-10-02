import { useId } from 'react'
import './Field.css'

export default function TextField({
  label,
  value,
  onChange,
  onBlur,
  error = '',
  multiline = false,
  hint,
  ...inputProps
}) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint ? hintId : null, errorId].filter(Boolean).join(' ')
  const Control = multiline ? 'textarea' : 'input'

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Control
        id={id}
        className="control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {hint && (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      )}
      {/* Always mounted so a screen reader hears the text when it appears. */}
      <p className="field-error" id={errorId} aria-live="polite">
        {error}
      </p>
    </div>
  )
}
