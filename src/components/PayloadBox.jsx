import { useId } from 'react'
import './PayloadBox.css'

export default function PayloadBox({ payload }) {
  const id = useId()

  return (
    <div className="payload">
      <label htmlFor={id}>Encoded payload</label>
      <textarea
        id={id}
        className="payload-text"
        value={payload}
        readOnly
        rows={4}
        placeholder="Nothing to encode yet"
      />
      <p className="payload-count mono">
        {payload.length} characters, {new TextEncoder().encode(payload).length} bytes
      </p>
    </div>
  )
}
