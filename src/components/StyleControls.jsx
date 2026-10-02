import SegmentedControl from './SegmentedControl.jsx'
import RangeField from './RangeField.jsx'
import ColorField from './ColorField.jsx'
import { ERROR_LEVELS, MARGIN_LIMITS, SIZE_LIMITS, describeLevel } from '../utils/settings.js'
import './StyleControls.css'

const LEVEL_OPTIONS = ERROR_LEVELS.map((level) => ({ value: level.value, label: level.value }))

export default function StyleControls({ settings, onChange }) {
  return (
    <div className="stack">
      <RangeField
        label="Size"
        unit="px"
        value={settings.size}
        limits={SIZE_LIMITS}
        onChange={(value) => onChange('size', value)}
      />
      <div className="style-colors">
        <ColorField
          label="Foreground color"
          value={settings.fgColor}
          onChange={(value) => onChange('fgColor', value)}
        />
        <ColorField
          label="Background color"
          value={settings.bgColor}
          onChange={(value) => onChange('bgColor', value)}
        />
      </div>
      <div>
        <SegmentedControl
          legend="Error correction"
          options={LEVEL_OPTIONS}
          value={settings.level}
          onChange={(value) => onChange('level', value)}
        />
        <p className="level-help" aria-live="polite">
          {describeLevel(settings.level)}
        </p>
      </div>
      <RangeField
        label="Margin"
        unit="modules"
        value={settings.margin}
        limits={MARGIN_LIMITS}
        onChange={(value) => onChange('margin', value)}
      />
    </div>
  )
}
