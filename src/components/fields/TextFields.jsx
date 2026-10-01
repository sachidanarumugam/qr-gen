import TextField from '../TextField.jsx'

export default function TextFields({ fields, onChange }) {
  return <TextField label="Text" value={fields.text} onChange={(value) => onChange('text', value)} multiline rows={4} />
}
