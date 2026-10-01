import TextField from '../TextField.jsx'
import { isValid, normalizeUrl } from '../../utils/validators.js'

export default function UrlFields({ fields, errors, onChange, onBlur }) {
  const normalized = normalizeUrl(fields.url)
  // Only worth mentioning when we changed what the user typed.
  const showFinalUrl = isValid('url', fields) && normalized !== fields.url.trim()

  return (
    <TextField
      label="URL"
      value={fields.url}
      onChange={(value) => onChange('url', value)}
      onBlur={() => onBlur('url')}
      error={errors.url}
      inputMode="url"
      autoCapitalize="off"
      autoComplete="off"
      spellCheck={false}
      placeholder="example.com"
      hint={showFinalUrl ? <>Final URL: <code>{normalized}</code></> : undefined}
    />
  )
}
