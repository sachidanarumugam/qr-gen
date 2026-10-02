import QRPreview from './QRPreview.jsx'
import ScanWarnings from './ScanWarnings.jsx'
import './LivePreview.css'

// Same canvas component as the result modal, so what you see is what the PNG contains.
export default function LivePreview({ payload, typeLabel, settings, compact = false }) {
  return (
    <figure className={compact ? 'live live-compact' : 'live'}>
      <figcaption className="live-label">Live preview</figcaption>
      {payload ? (
        <QRPreview payload={payload} typeLabel={typeLabel} settings={settings} />
      ) : (
        <div className="qr-empty" role="status">
          Enter valid content to see your QR code
        </div>
      )}
      {payload ? <ScanWarnings settings={settings} payloadLength={payload.length} /> : null}
    </figure>
  )
}
