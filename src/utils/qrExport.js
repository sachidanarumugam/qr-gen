// Phones miss codes whose modules land on fractional pixels. 4px is the
// smallest module that still scans once the quiet zone is included.
export const MIN_MODULE_PX = 4

// moduleSize is a whole number of pixels. The canvas is that size times the
// module count (data modules plus the quiet zone on every side), so it can
// be a little under the requested size.
export function exportGeometry(requestedSize, moduleCount) {
  const count = Math.max(1, Math.floor(moduleCount))
  let moduleSize = Math.max(1, Math.floor(requestedSize / count))
  let raised = false
  if (moduleSize < MIN_MODULE_PX) {
    moduleSize = MIN_MODULE_PX
    raised = true
  }
  return {
    moduleCount: count,
    moduleSize,
    exportSize: moduleSize * count,
    raised,
  }
}

export function exportLabel(geometry) {
  const size = `${geometry.exportSize} x ${geometry.exportSize} px`
  if (geometry.raised) return `Exports at ${size} so each module is at least 4 px.`
  return `Exports at ${size}`
}

export function parseRuns(path) {
  const runs = []
  const pattern = /M(-?\d+(?:\.\d+)?)[ ,](-?\d+(?:\.\d+)?)\s*h(-?\d+(?:\.\d+)?)v1/g
  for (const match of path.matchAll(pattern)) {
    runs.push({ x: Number(match[1]), y: Number(match[2]), w: Number(match[3]) })
  }
  return runs
}

// The SVG viewBox is one user unit per module, including the quiet zone.
export function modelFromMarkup(markup, margin) {
  const viewBox = markup.match(/viewBox=["']0[ ,]+0[ ,]+(\d+)[ ,]+(\d+)["']/i)
  if (!viewBox || viewBox[1] !== viewBox[2]) throw new Error('QR viewBox missing')
  const paths = [...markup.matchAll(/\bd=["']([^"']*)["']/g)]
  return {
    moduleCount: Number(viewBox[1]),
    margin: Math.max(0, Math.floor(Number(margin) || 0)),
    runs: parseRuns(paths[1]?.[1] ?? ''),
  }
}

export function buildQrExport(model, settings) {
  const geometry = exportGeometry(settings.size, model.moduleCount)
  return { model, geometry, label: exportLabel(geometry) }
}

// Paints the preview bitmap. The PNG is this canvas, so nothing here may
// scale, smooth, or add a border, shadow, or rounded corner.
export function paintQrCanvas(canvas, model, geometry, fgColor, bgColor) {
  const { exportSize, moduleSize } = geometry
  canvas.width = exportSize
  canvas.height = exportSize
  const context = canvas.getContext('2d')
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.imageSmoothingEnabled = false
  context.globalAlpha = 1
  context.fillStyle = bgColor
  context.fillRect(0, 0, exportSize, exportSize)
  context.fillStyle = fgColor
  for (const run of model.runs) {
    context.fillRect(run.x * moduleSize, run.y * moduleSize, run.w * moduleSize, moduleSize)
  }
  return canvas
}
