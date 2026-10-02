import { useRef, useState } from 'react'
import { Copy, Download, X } from 'lucide-react'
import QRPreview from './QRPreview.jsx'
import ScanWarnings from './ScanWarnings.jsx'
import useFocusTrap from '../hooks/useFocusTrap.js'
import { buildQrFilename, copyQrPng, downloadQrPng, downloadQrSvg } from '../utils/download.js'
import { buildQrSvg, modelFromMarkup } from '../utils/qrExport.js'
import './ResultModal.css'

const EXIT_MS = 200

// Fixed values keep the burst identical on every render and every device.
const CONFETTI = Array.from({ length: 28 }, (_, index) => {
  const angle = (index / 28) * Math.PI * 2 + (index % 3) * 0.3
  const distance = 150 + ((index * 41) % 150)
  return {
    dx: Math.round(Math.cos(angle) * distance * 1.25),
    dy: Math.round(Math.sin(angle) * distance) - 30,
    rotate: ((index * 97) % 720) - 360,
    delay: (index % 7) * 35,
    size: 10 + ((index * 5) % 9),
    color: ['lime', 'white', 'black'][index % 3],
  }
})

// `onClose` receives 'dismiss' or 'another' so the parent can place focus afterwards.
export default function ResultModal({ payload, type, typeLabel, settings, onClose }) {
  const dialogRef = useRef(null)
  const downloadRef = useRef(null)
  const canvasRef = useRef(null)
  const [closing, setClosing] = useState(false)
  const [copied, setCopied] = useState('')
  const copiedTimer = useRef(null)

  function requestClose(reason) {
    if (closing) return
    setClosing(true)
    window.setTimeout(() => onClose(reason), EXIT_MS)
  }

  useFocusTrap(dialogRef, !closing, () => requestClose('dismiss'), downloadRef)

  function svgMarkup() {
    const svg = canvasRef.current?.closest('.qr-frame')?.querySelector('.qr-source svg')
    if (!svg) return ''
    return buildQrSvg(modelFromMarkup(svg.outerHTML, settings.margin), settings)
  }

  function handleDownload() {
    if (!canvasRef.current) return
    downloadQrPng(canvasRef.current, buildQrFilename(type, new Date()))
  }

  function handleSvg() {
    const markup = svgMarkup()
    if (!markup) return
    downloadQrSvg(markup, buildQrFilename(type, new Date(), 'svg'))
  }

  async function handleCopy() {
    if (!canvasRef.current) return
    try {
      const copiedImage = await copyQrPng(canvasRef.current)
      if (copiedImage) {
        showCopied('Copied')
        return
      }
    } catch {
      // Fall through to copying the text the code contains.
    }
    try {
      await navigator.clipboard.writeText(payload)
      showCopied('Copied text')
    } catch {
      showCopied('Copy failed')
    }
  }

  function showCopied(text) {
    setCopied(text)
    window.clearTimeout(copiedTimer.current)
    copiedTimer.current = window.setTimeout(() => setCopied(''), 1600)
  }

  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget) requestClose('dismiss')
  }

  return (
    <div
      className={closing ? 'overlay result-overlay is-closing' : 'overlay result-overlay'}
      onMouseDown={handleOverlayMouseDown}
    >
      <div className="confetti" aria-hidden="true">
        {CONFETTI.map((piece, index) => (
          <span
            className={`confetti-piece confetti-${piece.color}`}
            key={index}
            style={{
              '--dx': `${piece.dx}px`,
              '--dy': `${piece.dy}px`,
              '--rotate': `${piece.rotate}deg`,
              '--delay': `${piece.delay + 250}ms`,
              '--size': `${piece.size}px`,
            }}
          />
        ))}
      </div>

      <div
        ref={dialogRef}
        className="modal on-light"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-text"
      >
        <button
          type="button"
          className="modal-close pressable"
          onClick={() => requestClose('dismiss')}
          aria-label="Close"
        >
          <X size={22} strokeWidth={3} aria-hidden="true" />
        </button>

        <svg className="check" viewBox="0 0 80 80" aria-hidden="true">
          <circle className="check-circle" cx="40" cy="40" r="35" />
          <path className="check-mark" d="M23 41l12 12 23-26" />
        </svg>

        <h2 id="modal-title" className="modal-title">
          QR created!
        </h2>
        <p id="modal-text" className="modal-text">
          Your code is ready.
        </p>

        <div className="qr-card">
          <QRPreview payload={payload} typeLabel={typeLabel} settings={settings} canvasRef={canvasRef} />
        </div>

        <ScanWarnings settings={settings} payloadLength={payload.length} />

        <div className="modal-actions">
          <button ref={downloadRef} type="button" className="btn btn-black pressable" onClick={handleDownload}>
            <Download size={22} strokeWidth={3} aria-hidden="true" />
            Download PNG
          </button>
          <button type="button" className="btn btn-white pressable" onClick={handleSvg}>
            <Download size={22} strokeWidth={3} aria-hidden="true" />
            Download SVG
          </button>
          <button type="button" className="btn btn-white pressable" onClick={handleCopy}>
            <Copy size={22} strokeWidth={3} aria-hidden="true" />
            <span aria-live="polite">{copied || 'Copy'}</span>
          </button>
          <button type="button" className="btn btn-white pressable" onClick={() => requestClose('another')}>
            Create another
          </button>
        </div>
      </div>
    </div>
  )
}
