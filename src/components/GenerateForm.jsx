import { ArrowRight } from 'lucide-react'
import Collapse from './Collapse.jsx'
import SegmentedControl from './SegmentedControl.jsx'
import TextField from './TextField.jsx'
import SelectField from './SelectField.jsx'
import CheckboxField from './CheckboxField.jsx'
import { QR_TYPES } from '../utils/payloads.js'
import { WIFI_SECURITY } from '../utils/validators.js'
import './GenerateForm.css'

const TYPE_OPTIONS = QR_TYPES.map((item) => ({ value: item.id, label: item.label }))

const SECURITY_OPTIONS = [
  { value: WIFI_SECURITY.WPA, label: 'WPA/WPA2/WPA3' },
  { value: WIFI_SECURITY.WEP, label: 'WEP' },
  { value: WIFI_SECURITY.NONE, label: 'None' },
]

// The one big input is the main field of each type. Anything else lives in the expanding panel.
const PRIMARY = {
  url: { name: 'url', label: 'URL', placeholder: 'example.com', inputMode: 'url' },
  text: { name: 'text', label: 'Text', placeholder: 'Type anything', multiline: true },
  email: { name: 'address', label: 'Email address', placeholder: 'name@example.com', inputMode: 'email' },
  phone: { name: 'phone', label: 'Phone number', placeholder: '+1 555 123 4567', inputMode: 'tel' },
  wifi: { name: 'ssid', label: 'Network name (SSID)', placeholder: 'Network name' },
}

export default function GenerateForm({
  type,
  fieldsByType,
  onTypeChange,
  onChange,
  onSubmit,
  errorText,
  shaking,
  busy,
  inputRef,
  generateRef,
  onShakeEnd,
}) {
  const primary = PRIMARY[type]
  const Control = primary.multiline ? 'textarea' : 'input'
  const emailFields = type === 'email'
  const wifiFields = type === 'wifi'
  const wifi = fieldsByType.wifi
  const email = fieldsByType.email

  function handleAnimationEnd(event) {
    // Child animations bubble up too; only the shake should clear the flag.
    if (event.animationName === 'shake') onShakeEnd()
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="generate-form" onSubmit={handleSubmit} noValidate>
      <div className={shaking ? 'bar-wrap is-shaking' : 'bar-wrap'} onAnimationEnd={handleAnimationEnd}>
        <div className="bar">
          <div className="swap" key={type}>
            <label className="visually-hidden" htmlFor="main-input">
              {primary.label}
            </label>
            <Control
              id="main-input"
              ref={inputRef}
              className="bar-input"
              value={fieldsByType[type][primary.name]}
              onChange={(event) => onChange(primary.name, event.target.value)}
              placeholder={primary.placeholder}
              inputMode={primary.inputMode}
              rows={primary.multiline ? 2 : undefined}
              autoCapitalize="off"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={errorText ? true : undefined}
              aria-describedby={errorText ? 'form-error' : undefined}
            />
          </div>
          <button
            ref={generateRef}
            type="submit"
            className="btn btn-lime bar-button pressable"
            aria-disabled={busy || undefined}
          >
            {busy ? 'Creating...' : 'Generate'}
            {!busy && <ArrowRight size={22} strokeWidth={3} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <p className={errorText ? 'error-tag is-visible' : 'error-tag'} id="form-error" role="alert">
        {errorText}
      </p>

      <SegmentedControl
        legend="QR code type"
        hideLegend
        variant="chip"
        options={TYPE_OPTIONS}
        value={type}
        onChange={onTypeChange}
      />

      <Collapse open={wifiFields}>
        <div className="extras">
          <SelectField
            label="Security"
            value={wifi.security}
            onChange={(value) => onChange('security', value)}
            options={SECURITY_OPTIONS}
          />
          {wifi.security !== WIFI_SECURITY.NONE && (
            <TextField
              label="Password"
              type="password"
              value={wifi.password}
              onChange={(value) => onChange('password', value)}
              autoComplete="off"
            />
          )}
          <CheckboxField
            label="Hidden network"
            checked={wifi.hidden}
            onChange={(checked) => onChange('hidden', checked)}
          />
        </div>
      </Collapse>

      <Collapse open={emailFields}>
        <div className="extras">
          <TextField
            label="Subject (optional)"
            value={email.subject}
            onChange={(value) => onChange('subject', value)}
          />
          <TextField
            label="Body (optional)"
            value={email.body}
            onChange={(value) => onChange('body', value)}
            multiline
            rows={3}
          />
        </div>
      </Collapse>
    </form>
  )
}
