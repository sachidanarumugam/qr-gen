import TextField from '../TextField.jsx'

export default function TextFields({ fields, errors, onChange, onBlur }) {
  return (
    <TextField
      label="Text"
      value={fields.text}
      onChange={(value) => onChange('text', value)}
      onBlur={() => onBlur('text')}
      error={errors.text}
      multiline
      rows={4}
    />
  )
}
