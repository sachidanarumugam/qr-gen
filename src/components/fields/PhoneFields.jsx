import TextField from '../TextField.jsx'

export default function PhoneFields({ fields, onChange }) {
  return (
    <TextField
      label="Phone number"
      type="tel"
      value={fields.phone}
      onChange={(value) => onChange('phone', value)}
      autoComplete="off"
      placeholder="+1 555 123 4567"
    />
  )
}
