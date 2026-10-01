import { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import QRPreview from './QRPreview.jsx'
import PayloadBox from './PayloadBox.jsx'
import ScanWarnings from './ScanWarnings.jsx'
import { buildQrFilename, downloadQrPng } from '../utils/download.js'
import './PreviewCard.css'

export default function PreviewCard({ payload, type, typeLabel, settings, onEncodeFailure }) {
  const canvasRef = useRef(null)
  // Holds the payload|level key that failed to encode. A new payload no longer matches, so the
  // button unlocks immediately and only locks again if the new value fails too.
  const [failedKey, setFailedKey] = useState(null)
  const encodeKey = `${payload}|${settings.level}`
  const encodeFailed = Boolean(payload) && failedKey === encodeKey
  const canDownload = Boolean(payload) && !encodeFailed

  useEffect(() => {
    onEncodeFailure?.(encodeFailed)
  }, [encodeFailed, onEncodeFailure])

  function handleDownload() {
    if (!canvasRef.current) return
    downloadQrPng(canvasRef.current, settings.size, buildQrFilename(type, new Date()))
  }

  return (
    <aside className="preview" aria-labelledby="preview-heading">
      <h2 className="preview-title" id="preview-heading">
        Preview
      </h2>
      <QRPreview
        payload={payload}
        typeLabel={typeLabel}
        settings={settings}
        canvasRef={canvasRef}
        onFailure={(failed) => setFailedKey(failed ? encodeKey : null)}
      />
      <button type="button" className="button button-primary download" disabled={!canDownload} onClick={handleDownload}>
        <Download size={20} strokeWidth={1.5} aria-hidden="true" />
        Download PNG
      </button>
      <ScanWarnings settings={settings} payloadLength={payload.length} />
      <PayloadBox payload={payload} />
    </aside>
  )
}
