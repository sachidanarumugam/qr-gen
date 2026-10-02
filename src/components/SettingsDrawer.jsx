import { useRef } from 'react'
import { X } from 'lucide-react'
import StyleControls from './StyleControls.jsx'
import PresetPicker from './PresetPicker.jsx'
import RecentList from './RecentList.jsx'
import useFocusTrap from '../hooks/useFocusTrap.js'
import './SettingsDrawer.css'

export default function SettingsDrawer({
  open,
  onClose,
  settings,
  onSettingChange,
  presetId,
  onSelectPreset,
  recent,
  onRestore,
  onDelete,
  onClear,
}) {
  const panelRef = useRef(null)
  useFocusTrap(panelRef, open, onClose)

  return (
    <div className={open ? 'drawer-root is-open' : 'drawer-root'} inert={!open}>
      {/* Pointer-only: keyboard users close with Escape or the X button. */}
      <div className="drawer-backdrop" onClick={onClose} />
      <aside ref={panelRef} className="drawer on-light" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-head">
          <div className="drawer-title-wrap">
            <h2 id="drawer-title" className="drawer-title">
              Settings
            </h2>
            <span className="sticker" aria-hidden="true">
              Make it yours
            </span>
          </div>
          <button type="button" className="icon-button pressable" onClick={onClose} aria-label="Close settings">
            <X size={24} strokeWidth={3} aria-hidden="true" />
          </button>
        </div>

        <section className="drawer-section" aria-labelledby="drawer-style">
          <h3 id="drawer-style">Style</h3>
          <StyleControls settings={settings} onChange={onSettingChange} />
        </section>
        <section className="drawer-section" aria-labelledby="drawer-presets">
          <h3 id="drawer-presets">Presets</h3>
          <PresetPicker activeId={presetId} onSelect={onSelectPreset} />
        </section>
        <section className="drawer-section" aria-labelledby="drawer-recent">
          <h3 id="drawer-recent">Recent</h3>
          <RecentList entries={recent} onRestore={onRestore} onDelete={onDelete} onClear={onClear} />
        </section>
      </aside>
    </div>
  )
}
