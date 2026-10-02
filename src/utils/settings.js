export const SIZE_LIMITS = { min: 128, max: 1024 }
export const MARGIN_LIMITS = { min: 0, max: 10 }

export const ERROR_LEVELS = [
  { value: 'L', name: 'Low', recovery: 7 },
  { value: 'M', name: 'Medium', recovery: 15 },
  { value: 'Q', name: 'Quartile', recovery: 25 },
  { value: 'H', name: 'High', recovery: 30 },
]

export const DEFAULT_SETTINGS = {
  size: 1024,
  level: 'Q',
  fgColor: '#000000',
  bgColor: '#ffffff',
  margin: 4,
}

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

function parseNumber(raw) {
  if (typeof raw === 'string' && raw.trim() === '') return null
  const number = Number(raw)
  return Number.isFinite(number) ? number : null
}

// For use while typing: only a value already inside the limits is accepted,
// so typing "3" on the way to "300" does not jump the preview to the minimum.
export function parseIntInRange(raw, { min, max }) {
  const number = parseNumber(raw)
  if (number === null || number < min || number > max) return null
  return Math.round(number)
}

// For use when editing ends: always returns a whole number inside the limits.
export function clampInt(raw, { min, max }, fallback) {
  const number = parseNumber(raw)
  if (number === null) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

// Returns lowercase #rrggbb, or null when the text is not #RGB or #RRGGBB.
export function normalizeHex(input) {
  const text = input.trim()
  if (!HEX_COLOR.test(text)) return null
  const digits = text.slice(1).toLowerCase()
  if (digits.length === 3) {
    return `#${[...digits].map((digit) => digit + digit).join('')}`
  }
  return `#${digits}`
}

export function describeLevel(level) {
  const { name, value, recovery } = ERROR_LEVELS.find((item) => item.value === level)
  return `${name} (${value}): the code still scans if about ${recovery}% of it is damaged or covered.`
}
