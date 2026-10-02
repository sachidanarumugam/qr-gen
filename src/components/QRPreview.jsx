import { QRCodeCanvas } from 'qrcode.react'
import QRErrorBoundary from './QRErrorBoundary.jsx'
import './QRPreview.css'

export default function QRPreview({ payload, typeLabel, settings, canvasRef, onFailure }) {
  return (
    <QRErrorBoundary
      resetKey={`${payload}|${settings.level}`}
      onFailure={onFailure}
      fallback={
        <div className="qr-empty" role="status">
          This content is too long for a QR code
        </div>
      }
    >
      <div className="qr-frame">
        {/* Canvas (not SVG) so the PNG export can copy its pixels. */}
        <QRCodeCanvas
          ref={canvasRef}
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
          // Scale down to fit the card while keeping the real pixel size for export.
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
    </QRErrorBoundary>
  )
}
