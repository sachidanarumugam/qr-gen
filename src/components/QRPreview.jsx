import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import QRErrorBoundary from './QRErrorBoundary.jsx'
import { buildQrExport, modelFromMarkup, paintQrCanvas } from '../utils/qrExport.js'
import './QRPreview.css'

function QrCanvas({ payload, typeLabel, settings, canvasRef }) {
  const svgRef = useRef(null)
  const localRef = useRef(null)
  const [label, setLabel] = useState('')

  const setCanvas = useCallback(
    (node) => {
      localRef.current = node
      if (typeof canvasRef === 'function') canvasRef(node)
      else if (canvasRef) canvasRef.current = node
    },
    [canvasRef],
  )

  useLayoutEffect(() => {
    const svg = svgRef.current
    const canvas = localRef.current
    if (!svg || !canvas) return undefined
    let cancel = false
    const exported = buildQrExport(modelFromMarkup(svg.outerHTML, settings.margin), settings)
    const paint = (logoImage) => {
      if (cancel) return
      paintQrCanvas(canvas, exported.model, exported.geometry, settings.fgColor, settings.bgColor, {
        pattern: settings.pattern,
        gradient: settings.gradient,
        gradientEnd: settings.gradientEnd,
        logoImage,
      })
    }
    paint(null)
    setLabel(exported.label)
    if (!settings.logo) return () => {
      cancel = true
    }
    const image = new Image()
    image.onload = () => paint(image)
    image.src = settings.logo
    return () => {
      cancel = true
    }
  }, [payload, settings])

  return (
    <div className="qr-frame">
      {/* The SVG is only the module grid. The canvas below is what is shown and downloaded. */}
      <div className="qr-source" aria-hidden="true">
        <QRCodeSVG
          ref={svgRef}
          value={payload}
          size={1}
          level={settings.level}
          fgColor="#000000"
          bgColor="#ffffff"
          marginSize={settings.margin}
          boostLevel={false}
        />
      </div>
      <canvas ref={setCanvas} role="img" aria-label={`QR code for ${typeLabel}`} />
      {label ? <p className="qr-export-size">{label}</p> : null}
    </div>
  )
}

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
      <QrCanvas payload={payload} typeLabel={typeLabel} settings={settings} canvasRef={canvasRef} />
    </QRErrorBoundary>
  )
}
