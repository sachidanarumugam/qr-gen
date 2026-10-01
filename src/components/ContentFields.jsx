import UrlFields from './fields/UrlFields.jsx'
import TextFields from './fields/TextFields.jsx'
import EmailFields from './fields/EmailFields.jsx'
import PhoneFields from './fields/PhoneFields.jsx'
import WifiFields from './fields/WifiFields.jsx'

const FIELD_COMPONENTS = {
  url: UrlFields,
  text: TextFields,
  email: EmailFields,
  phone: PhoneFields,
  wifi: WifiFields,
}

export default function ContentFields({ type, fields, errors, onChange, onBlur }) {
  const TypeFields = FIELD_COMPONENTS[type]
  return (
    <div className="stack">
      <TypeFields fields={fields} errors={errors} onChange={onChange} onBlur={onBlur} />
    </div>
  )
}
