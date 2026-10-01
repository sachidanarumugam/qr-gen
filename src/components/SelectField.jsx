import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import './Field.css'

export default function SelectField({ label, value, onChange, options }) {
  const id = useId()

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="select-wrap">
        <select id={id} className="control" value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="select-icon" size={20} strokeWidth={1.5} aria-hidden="true" />
      </div>
    </div>
  )
}
