import { SlidersHorizontal } from 'lucide-react'
import './SettingsButton.css'

export default function SettingsButton({ onClick, expanded, buttonRef }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className="settings-button pressable"
      onClick={onClick}
      aria-label="Open settings"
      aria-haspopup="dialog"
      aria-expanded={expanded}
    >
      <SlidersHorizontal size={26} strokeWidth={2.75} aria-hidden="true" />
    </button>
  )
}
