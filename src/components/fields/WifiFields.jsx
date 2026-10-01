import TextField from '../TextField.jsx'
import SelectField from '../SelectField.jsx'
import CheckboxField from '../CheckboxField.jsx'
import { WIFI_SECURITY } from '../../utils/validators.js'

const SECURITY_OPTIONS = [
  { value: WIFI_SECURITY.WPA, label: 'WPA/WPA2/WPA3' },
  { value: WIFI_SECURITY.WEP, label: 'WEP' },
  { value: WIFI_SECURITY.NONE, label: 'None' },
]

export default function WifiFields({ fields, errors, onChange, onBlur }) {
  return (
    <>
      <TextField
        label="Network name (SSID)"
        value={fields.ssid}
        onChange={(value) => onChange('ssid', value)}
        onBlur={() => onBlur('ssid')}
        error={errors.ssid}
        autoCapitalize="off"
        autoComplete="off"
        spellCheck={false}
      />
      <SelectField
        label="Security"
        value={fields.security}
        onChange={(value) => onChange('security', value)}
        options={SECURITY_OPTIONS}
      />
      {fields.security !== WIFI_SECURITY.NONE && (
        <TextField
          label="Password"
          type="password"
          value={fields.password}
          onChange={(value) => onChange('password', value)}
          onBlur={() => onBlur('password')}
          error={errors.password}
          autoComplete="off"
        />
      )}
      <CheckboxField
        label="Hidden network"
        checked={fields.hidden}
        onChange={(checked) => onChange('hidden', checked)}
      />
    </>
  )
}
