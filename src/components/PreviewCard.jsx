import './PreviewCard.css'

export default function PreviewCard() {
  return (
    <aside className="preview" aria-labelledby="preview-heading">
      <h2 className="preview-title" id="preview-heading">
        Preview
      </h2>
      <div className="preview-empty">Enter valid content to see your QR code</div>
    </aside>
  )
}
