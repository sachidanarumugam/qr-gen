import { normalizeHex } from './settings.js'

// WCAG 2 relative luminance. The 0.03928 cutoff is the sRGB linearization threshold.
function channel(value) {
  const srgb = value / 255
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(color) {
  const hex = normalizeHex(color)
  if (!hex) throw new Error(`Invalid color: ${color}`)
  const value = Number.parseInt(hex.slice(1), 16)
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
}

export function contrastRatio(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background))
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

export function isForegroundLighter(foreground, background) {
  return relativeLuminance(foreground) > relativeLuminance(background)
}

const CONTRAST_STRONG = 2
const CONTRAST_WARN = 4
const SMALL_SIZE = 160
const QUIET_ZONE = 4
const LONG_PAYLOAD = 200
const LONG_PAYLOAD_SIZE = 256

// Warnings never block a download. They only describe why a scan might fail.
export function getScanWarnings({ fgColor, bgColor, size, margin, payloadLength }) {
  const warnings = []
  const ratio = contrastRatio(fgColor, bgColor)

  if (ratio < CONTRAST_STRONG) {
    warnings.push({
      id: 'contrast',
      strong: true,
      text: 'These colors are too close. Most scanners will fail to read this code.',
    })
  } else if (ratio < CONTRAST_WARN) {
    warnings.push({
      id: 'contrast',
      strong: false,
      text: 'These colors are hard to tell apart. A scanner may miss this code.',
    })
  }

  if (isForegroundLighter(fgColor, bgColor)) {
    warnings.push({
      id: 'inverted',
      strong: false,
      text: 'The foreground is lighter than the background. Scanners expect dark marks on a light background.',
    })
  }

  if (size < SMALL_SIZE) {
    warnings.push({
      id: 'size',
      strong: false,
      text: 'This size is under 160 px. Small codes are harder to scan, especially on a screen.',
    })
  }

  if (margin < QUIET_ZONE) {
    warnings.push({
      id: 'margin',
      strong: false,
      text: 'The margin is under 4 modules. Scanners need that empty border, called the quiet zone.',
    })
  }

  if (payloadLength > LONG_PAYLOAD && size < LONG_PAYLOAD_SIZE) {
    warnings.push({
      id: 'length',
      strong: false,
      text: 'This content is long and the size is under 256 px. The modules get very small and may not scan.',
    })
  }

  return warnings
}
