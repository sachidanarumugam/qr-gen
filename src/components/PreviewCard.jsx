import QRPreview from './QRPreview.jsx'
import PayloadBox from './PayloadBox.jsx'
import './PreviewCard.css'

export default function PreviewCard({ payload, typeLabel, settings }) {
  return (
    <aside className="preview" aria-labelledby="preview-heading">
      <h2 className="preview-title" id="preview-heading">
        Preview
      </h2>
      <QRPreview payload={payload} typeLabel={typeLabel} settings={settings} />
      <PayloadBox payload={payload} />
    </aside>
  )
}
