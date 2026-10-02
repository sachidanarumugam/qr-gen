import './ThemeToggle.css'

function Sun() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
        d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"
      />
    </svg>
  )
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path fill="currentColor" d="M14 3a8 8 0 1 0 7 12A7 7 0 0 1 14 3z" />
    </svg>
  )
}

export default function ThemeToggle({ enabled, onToggle }) {
  return (
    <button type="button" className="theme-switch" role="switch" aria-checked={enabled} onClick={onToggle}>
      <span className="theme-switch-track" aria-hidden="true">
        <span className="theme-switch-thumb">{enabled ? <Moon /> : <Sun />}</span>
      </span>
      <span className="theme-switch-label">Night mode: {enabled ? 'On' : 'Off'}</span>
    </button>
  )
}
