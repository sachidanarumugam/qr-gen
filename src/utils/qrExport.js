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

// The three corner eyes, and the timing lines that connect them, have to stay
// square. A phone looks for that shape before it reads anything else.
export function moduleRole(x, y, moduleCount, margin) {
  const eyes = [
    [margin, margin],
    [moduleCount - margin - 7, margin],
    [margin, moduleCount - margin - 7],
  ]
  for (const [eyeX, eyeY] of eyes) {
    if (x >= eyeX && x < eyeX + 7 && y >= eyeY && y < eyeY + 7) return 'finder'
  }
  const timing = margin + 6
  const start = margin + 7
  const end = moduleCount - margin - 7
  if (y === timing && x >= start && x < end) return 'timing'
  if (x === timing && y >= start && y < end) return 'timing'
  return 'data'
}

export function logoModules(moduleCount, margin) {
  const inner = Math.max(1, moduleCount - margin * 2)
  let span = Math.max(3, Math.round(inner * 0.2))
  if (span % 2 === 0) span += 1
  const maxSpan = inner - 16
  if (maxSpan >= 3) span = Math.min(span, maxSpan % 2 === 0 ? maxSpan - 1 : maxSpan)
  span = Math.min(span, inner)
  const origin = margin + Math.floor((inner - span) / 2)
  return { origin, span }
}

function patternName(pattern) {
  if (pattern === 'rounded' || pattern === 'dots' || pattern === 'diamond') return pattern
  return 'square'
}

function foregroundPaint(context, exportSize, fgColor, extras) {
  if (extras.gradient && extras.gradientEnd) {
    const gradient = context.createLinearGradient(0, 0, exportSize, exportSize)
    gradient.addColorStop(0, fgColor)
    gradient.addColorStop(1, extras.gradientEnd)
    return gradient
  }
  return fgColor
}

function drawDataModule(context, x, y, moduleSize, pattern) {
  const px = x * moduleSize
  const py = y * moduleSize
  if (pattern === 'rounded') {
    const radius = Math.max(1, Math.floor(moduleSize * 0.3))
    context.beginPath()
    if (typeof context.roundRect === 'function') context.roundRect(px, py, moduleSize, moduleSize, radius)
    else context.rect(px, py, moduleSize, moduleSize)
    context.fill()
    return
  }
  if (pattern === 'dots') {
    context.beginPath()
    context.arc(px + moduleSize / 2, py + moduleSize / 2, moduleSize * 0.42, 0, Math.PI * 2)
    context.fill()
    return
  }
  const inset = moduleSize * 0.08
  const midX = px + moduleSize / 2
  const midY = py + moduleSize / 2
  context.beginPath()
  context.moveTo(midX, py + inset)
  context.lineTo(px + moduleSize - inset, midY)
  context.lineTo(midX, py + moduleSize - inset)
  context.lineTo(px + inset, midY)
  context.closePath()
  context.fill()
}

function paintLogo(context, model, geometry, bgColor, logoImage) {
  if (!logoImage) return
  const { origin, span } = logoModules(model.moduleCount, model.margin)
  const { moduleSize } = geometry
  const pad = Math.min(1, origin)
  context.fillStyle = bgColor
  context.fillRect((origin - pad) * moduleSize, (origin - pad) * moduleSize, (span + pad * 2) * moduleSize, (span + pad * 2) * moduleSize)
  context.imageSmoothingEnabled = true
  context.drawImage(logoImage, origin * moduleSize, origin * moduleSize, span * moduleSize, span * moduleSize)
  context.imageSmoothingEnabled = false
}

// Paints the preview bitmap. The PNG is this canvas. The default square code
// stays on whole pixels with no border, shadow, or rounded corner.
export function paintQrCanvas(canvas, model, geometry, fgColor, bgColor, extras = {}) {
  const { exportSize, moduleSize } = geometry
  const pattern = patternName(extras.pattern)
  canvas.width = exportSize
  canvas.height = exportSize
  const context = canvas.getContext('2d')
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.imageSmoothingEnabled = false
  context.globalAlpha = 1
  context.fillStyle = bgColor
  context.fillRect(0, 0, exportSize, exportSize)
  context.fillStyle = foregroundPaint(context, exportSize, fgColor, extras)
  if (pattern === 'square') {
    for (const run of model.runs) {
      context.fillRect(run.x * moduleSize, run.y * moduleSize, run.w * moduleSize, moduleSize)
    }
  } else {
    for (const run of model.runs) {
      for (let offset = 0; offset < run.w; offset += 1) {
        const x = run.x + offset
        const role = moduleRole(x, run.y, model.moduleCount, model.margin)
        if (role === 'data') drawDataModule(context, x, run.y, moduleSize, pattern)
        else context.fillRect(x * moduleSize, run.y * moduleSize, moduleSize, moduleSize)
      }
    }
  }
  paintLogo(context, model, geometry, bgColor, extras.logoImage)
  return canvas
}

function xmlEscape(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function svgShape(x, y, pattern, fill) {
  if (pattern === 'rounded') {
    return `<rect x="${x}" y="${y}" width="1" height="1" rx="0.3" fill="${fill}"/>`
  }
  if (pattern === 'dots') {
    return `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.42" fill="${fill}"/>`
  }
  if (pattern === 'diamond') {
    const points = `${x + 0.5},${y + 0.08} ${x + 0.92},${y + 0.5} ${x + 0.5},${y + 0.92} ${x + 0.08},${y + 0.5}`
    return `<polygon points="${points}" fill="${fill}"/>`
  }
  return `<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`
}

// Vector copy of the same modules, pattern, gradient and logo as the canvas.
export function buildQrSvg(model, settings) {
  const geometry = exportGeometry(settings.size, model.moduleCount)
  const count = model.moduleCount
  const pattern = patternName(settings.pattern)
  const fg = xmlEscape(settings.fgColor)
  const bg = xmlEscape(settings.bgColor)
  const fill = settings.gradient && settings.gradientEnd ? 'url(#qr-fg)' : fg
  const parts = []
  if (pattern === 'square') {
    for (const run of model.runs) {
      parts.push(`<rect x="${run.x}" y="${run.y}" width="${run.w}" height="1" fill="${fill}"/>`)
    }
  } else {
    for (const run of model.runs) {
      for (let offset = 0; offset < run.w; offset += 1) {
        const x = run.x + offset
        const role = moduleRole(x, run.y, count, model.margin)
        parts.push(svgShape(x, run.y, role === 'data' ? pattern : 'square', fill))
      }
    }
  }
  let defs = ''
  if (settings.gradient && settings.gradientEnd) {
    defs = `<defs><linearGradient id="qr-fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${fg}"/><stop offset="1" stop-color="${xmlEscape(settings.gradientEnd)}"/></linearGradient></defs>`
  }
  let logo = ''
  if (settings.logo) {
    const { origin, span } = logoModules(count, model.margin)
    const pad = Math.min(1, origin)
    logo = `<rect x="${origin - pad}" y="${origin - pad}" width="${span + pad * 2}" height="${span + pad * 2}" fill="${bg}"/><image href="${xmlEscape(settings.logo)}" x="${origin}" y="${origin}" width="${span}" height="${span}" preserveAspectRatio="xMidYMid meet"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${geometry.exportSize}" height="${geometry.exportSize}" viewBox="0 0 ${count} ${count}" shape-rendering="crispEdges">${defs}<rect width="${count}" height="${count}" fill="${bg}"/>${parts.join('')}${logo}</svg>`
}
