export function buildQrFilename(type, date, extension = 'png') {
  const pad = (value) => String(value).padStart(2, '0')
  const stamp = [
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`,
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`,
  ].join('-')
  return `qr-${type}-${stamp}.${extension}`
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

// The file is the preview bitmap. A second canvas would resample the modules.
export function downloadQrPng(canvas, filename) {
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, filename)
  }, 'image/png')
}

export function downloadQrSvg(markup, filename) {
  downloadBlob(new Blob([markup], { type: 'image/svg+xml' }), filename)
}

export function canvasToPngBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

// Copies the PNG. Returns false when the browser refuses the image clipboard.
export async function copyQrPng(canvas) {
  const blob = await canvasToPngBlob(canvas)
  if (!blob || !navigator.clipboard?.write || typeof ClipboardItem === 'undefined') return false
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
  return true
}
