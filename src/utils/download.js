// The on-screen canvas is sized in CSS pixels but its bitmap is multiplied by
// devicePixelRatio. Copying it onto a canvas of the selected size makes the
// file match the number the user picked, on any screen.
export function buildQrFilename(type, date) {
  const pad = (value) => String(value).padStart(2, '0')
  const stamp = [
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`,
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`,
  ].join('-')
  return `qr-${type}-${stamp}.png`
}

export function paintExactSize(source, size) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  // Smoothing would blur the modules when the bitmap is scaled down.
  context.imageSmoothingEnabled = false
  context.drawImage(source, 0, 0, size, size)
  return canvas
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadQrPng(source, size, filename) {
  const canvas = paintExactSize(source, size)
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, filename)
  }, 'image/png')
}
