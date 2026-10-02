import { QRCodeSVG } from 'qrcode.react'
import { PRESETS, PRESET_SWATCH_VALUE } from '../utils/presets.js'
import './PresetPicker.css'

export default function PresetPicker({ activeId, onSelect }) {
  const active = PRESETS.find((preset) => preset.id === activeId)

  return (
    <div className="stack">
      <p className="preset-status">
        Current preset: <strong>{active ? active.name : 'Custom'}</strong>
      </p>
      <div className="preset-grid">
        {PRESETS.map((preset) => {
          const selected = preset.id === activeId
          return (
            <button
              key={preset.id}
              type="button"
              className={selected ? 'preset pressable is-active' : 'preset pressable'}
              aria-pressed={selected}
              onClick={() => onSelect(preset.id)}
            >
              <QRCodeSVG
                value={PRESET_SWATCH_VALUE}
                size={56}
                level={preset.level}
                fgColor={preset.fgColor}
                bgColor={preset.bgColor}
                marginSize={preset.margin}
                boostLevel={false}
                aria-hidden="true"
              />
              <span>{preset.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
