import { getScanWarnings } from '../utils/contrast.js'
import './ScanWarnings.css'

export default function ScanWarnings({ settings, payloadLength }) {
  const warnings = getScanWarnings({
    fgColor: settings.fgColor,
    bgColor: settings.bgColor,
    size: settings.size,
    margin: settings.margin,
    payloadLength,
  })

  if (warnings.length === 0) return null

  return (
    <div className="scan-warnings" role="status">
      {warnings.map((warning) => (
        <p key={warning.id} className={warning.strong ? 'is-strong' : undefined}>
          {warning.text}
        </p>
      ))}
    </div>
  )
}
