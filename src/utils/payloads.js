import { WIFI_SECURITY, isValid, normalizePhone, normalizeUrl } from './validators.js'

export const QR_TYPES = [
  { id: 'url', label: 'URL' },
  { id: 'text', label: 'Text' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'wifi', label: 'Wi-Fi' },
]

// One entry per type so switching types never erases what was typed.
export const EMPTY_FIELDS = {
  url: { url: '' },
  text: { text: '' },
  email: { address: '', subject: '', body: '' },
  phone: { phone: '' },
  wifi: { ssid: '', security: WIFI_SECURITY.WPA, password: '', hidden: false },
}

// The Wi-Fi QR format treats these characters as separators, so a literal one
// must be preceded by a backslash. A single pass avoids escaping the escapes.
export function escapeWifiValue(value) {
  return value.replace(/[\\;,:"]/g, '\\$&')
}

function buildUrl({ url }) {
  return normalizeUrl(url)
}

function buildText({ text }) {
  return text
}

function buildEmail({ address, subject, body }) {
  const params = []
  if (subject.trim()) params.push(`subject=${encodeURIComponent(subject.trim())}`)
  if (body.trim()) params.push(`body=${encodeURIComponent(body.trim())}`)
  const query = params.length > 0 ? `?${params.join('&')}` : ''
  return `mailto:${address.trim()}${query}`
}

function buildPhone({ phone }) {
  return `tel:${normalizePhone(phone)}`
}

function buildWifi({ ssid, security, password, hidden }) {
  const isOpen = security === WIFI_SECURITY.NONE
  let payload = `WIFI:T:${security};S:${escapeWifiValue(ssid)};`
  if (!isOpen) payload += `P:${escapeWifiValue(password)};`
  if (hidden) payload += 'H:true;'
  return `${payload};`
}

const BUILDERS = {
  url: buildUrl,
  text: buildText,
  email: buildEmail,
  phone: buildPhone,
  wifi: buildWifi,
}

// Returns '' for invalid input so callers have one check for "nothing to encode".
export function buildPayload(type, fields) {
  if (!isValid(type, fields)) return ''
  return BUILDERS[type](fields)
}
