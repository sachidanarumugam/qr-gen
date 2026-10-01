import { QRCodeCanvas } from 'qrcode.react'
import QRErrorBoundary from './QRErrorBoundary.jsx'
import './QRPreview.css'

export default function QRPreview({ payload, typeLabel, settings }) {
  if (!payload) {
    return <div className="qr-empty">Enter valid content to see your QR code</div>
  }

  return (
    <QRErrorBoundary
      resetKey={`${payload}|${settings.level}`}
      fallback={<div className="qr-empty">This content is too long for a QR code</div>}
    >
      <div className="qr-frame">
        {/* Canvas (not SVG) because the PNG export in a later step reads from it. */}
        <QRCodeCanvas
          value={payload}
          size={settings.size}
          level={settings.level}
          fgColor={settings.fgColor}
          bgColor={settings.bgColor}
          marginSize={settings.margin}
          // Without this the library may raise the level, so the chosen level would not be what is encoded.
          boostLevel={false}
          role="img"
          aria-label={`QR code for ${typeLabel}`}
          // Scale down to fit narrow screens while keeping the real pixel size for export.
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </QRErrorBoundary>
  )
}
