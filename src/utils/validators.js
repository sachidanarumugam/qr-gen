// Each validator returns an object of { fieldName: message }.
// An empty object means the fields are valid. Messages are always shown to
// users as-is, so they say exactly what is wrong.

export const WIFI_SECURITY = {
  WPA: 'WPA',
  WEP: 'WEP',
  NONE: 'nopass',
}

// The 802.11 limit is 32 bytes, not characters: accented letters and emoji take 2 to 4 bytes each.
const SSID_MAX_BYTES = 32
const WPA_PASSWORD_MIN = 8
const WPA_PASSWORD_MAX = 63
const PHONE_MIN_DIGITS = 7
const PHONE_MAX_DIGITS = 15

const SCHEME = /^[a-z][a-z0-9+.-]*:/i
// "localhost:3000" looks like a scheme followed by a number, so it has to be
// recognised as host:port or it would be rejected as an unknown protocol.
const HOST_WITH_PORT = /^[a-z0-9.-]+:\d+(?:[/?#]|$)/i

// WEP keys are 5 or 13 ASCII characters, or 10 or 26 hex digits (64-bit and 128-bit keys).
const WEP_ASCII_LENGTHS = [5, 13]
const WEP_HEX_KEY = /^(?:[0-9a-f]{10}|[0-9a-f]{26})$/i

// At least one dot with text on both sides, so "hello." and ".com" are rejected.
const DOTTED_HOST = /[^.]\.[^.]/

const EMAIL_LOCAL = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/
const EMAIL_DOMAIN = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/
const EMAIL_MAX_LENGTH = 254

const PHONE_ALLOWED = /^\+?[\d\s\-()]*$/

export function normalizeUrl(input) {
  const trimmed = input.trim()
  if (!trimmed) return ''
  const hasScheme = SCHEME.test(trimmed) && !HOST_WITH_PORT.test(trimmed)
  return hasScheme ? trimmed : `https://${trimmed}`
}

// Returns "+" followed by digits, or only digits when the user did not type a "+".
export function normalizePhone(input) {
  const trimmed = input.trim()
  const digits = trimmed.replace(/\D/g, '')
  return trimmed.startsWith('+') ? `+${digits}` : digits
}

export function isValidWepKey(password) {
  return WEP_ASCII_LENGTHS.includes(password.length) || WEP_HEX_KEY.test(password)
}

export function isValidEmailAddress(address) {
  if (address.length > EMAIL_MAX_LENGTH) return false
  const parts = address.split('@')
  if (parts.length !== 2) return false
  const [local, domain] = parts
  if (!EMAIL_LOCAL.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return false
  }
  return EMAIL_DOMAIN.test(domain)
}

function validateUrl({ url }) {
  const normalized = normalizeUrl(url)
  if (!normalized) return { url: 'Enter a URL' }

  let parsed
  try {
    parsed = new URL(normalized)
  } catch {
    return { url: 'Enter a valid URL, for example https://example.com' }
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { url: 'URL must start with http:// or https://' }
  }
  // new URL() accepts single words like "hello", which are almost always typos.
  if (parsed.hostname !== 'localhost' && !DOTTED_HOST.test(parsed.hostname)) {
    return { url: 'URL needs a domain name such as example.com' }
  }
  return {}
}

function validateText({ text }) {
  return text.trim() ? {} : { text: 'Enter some text' }
}

function validateEmail({ address }) {
  const trimmed = address.trim()
  if (!trimmed) return { address: 'Enter an email address' }
  if (!isValidEmailAddress(trimmed)) return { address: 'Enter a valid email address' }
  return {}
}

function validatePhone({ phone }) {
  const trimmed = phone.trim()
  if (!trimmed) return { phone: 'Enter a phone number' }
  if (!PHONE_ALLOWED.test(trimmed)) {
    return { phone: 'Phone number can only contain digits, spaces, dashes, parentheses and a leading +' }
  }
  const digitCount = trimmed.replace(/\D/g, '').length
  if (digitCount < PHONE_MIN_DIGITS || digitCount > PHONE_MAX_DIGITS) {
    return { phone: `Phone number must have ${PHONE_MIN_DIGITS} to ${PHONE_MAX_DIGITS} digits` }
  }
  return {}
}

function validateWifi({ ssid, security, password }) {
  const errors = {}

  if (!ssid.trim()) {
    errors.ssid = 'Enter the network name (SSID)'
  } else if (new TextEncoder().encode(ssid).length > SSID_MAX_BYTES) {
    errors.ssid = `Network name must be ${SSID_MAX_BYTES} bytes or fewer (accented letters and emoji use 2 to 4 bytes each)`
  }

  if (security === WIFI_SECURITY.NONE) return errors

  if (!password) {
    errors.password = 'Enter the Wi-Fi password'
  } else if (
    security === WIFI_SECURITY.WPA &&
    (password.length < WPA_PASSWORD_MIN || password.length > WPA_PASSWORD_MAX)
  ) {
    errors.password = `Wi-Fi password must be ${WPA_PASSWORD_MIN} to ${WPA_PASSWORD_MAX} characters`
  } else if (security === WIFI_SECURITY.WEP && !isValidWepKey(password)) {
    errors.password = 'WEP password must be 5 or 13 characters, or 10 or 26 hex digits'
  }
  return errors
}

const VALIDATORS = {
  url: validateUrl,
  text: validateText,
  email: validateEmail,
  phone: validatePhone,
  wifi: validateWifi,
}

export function validateFields(type, fields) {
  const validate = VALIDATORS[type]
  if (!validate) throw new Error(`Unknown QR type: ${type}`)
  return validate(fields)
}

export function isValid(type, fields) {
  return Object.keys(validateFields(type, fields)).length === 0
}
