import TextField from '../TextField.jsx'

export default function PhoneFields({ fields, errors, onChange, onBlur }) {
  return (
    <TextField
      label="Phone number"
      type="tel"
      value={fields.phone}
      onChange={(value) => onChange('phone', value)}
      onBlur={() => onBlur('phone')}
      error={errors.phone}
      autoComplete="off"
      placeholder="+1 555 123 4567"
    />
  )
}
