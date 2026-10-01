import TextField from '../TextField.jsx'

export default function EmailFields({ fields, errors, onChange, onBlur }) {
  return (
    <>
      <TextField
        label="Email address"
        type="email"
        value={fields.address}
        onChange={(value) => onChange('address', value)}
        onBlur={() => onBlur('address')}
        error={errors.address}
        autoCapitalize="off"
        autoComplete="off"
        spellCheck={false}
      />
      <TextField label="Subject (optional)" value={fields.subject} onChange={(value) => onChange('subject', value)} />
      <TextField
        label="Body (optional)"
        value={fields.body}
        onChange={(value) => onChange('body', value)}
        multiline
        rows={3}
      />
    </>
  )
}
