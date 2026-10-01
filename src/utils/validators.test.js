import { describe, expect, it } from 'vitest'
import {
  WIFI_SECURITY,
  isValid,
  isValidEmailAddress,
  normalizePhone,
  normalizeUrl,
  validateFields,
} from './validators.js'

describe('normalizeUrl', () => {
  it('prepends https:// when the protocol is missing', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com')
    expect(normalizeUrl('  example.com/path?q=1  ')).toBe('https://example.com/path?q=1')
  })

  it('keeps an existing http or https protocol', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com')
    expect(normalizeUrl('HTTPS://example.com')).toBe('HTTPS://example.com')
  })

  it('treats host:port as a missing protocol', () => {
    expect(normalizeUrl('localhost:3000')).toBe('https://localhost:3000')
    expect(normalizeUrl('example.com:8080/a')).toBe('https://example.com:8080/a')
  })

  it('returns an empty string for blank input', () => {
    expect(normalizeUrl('   ')).toBe('')
  })
})

describe('url validation', () => {
  const check = (url) => validateFields('url', { url })

  it('accepts http and https URLs', () => {
    expect(check('https://example.com')).toEqual({})
    expect(check('http://example.com/a?b=c#d')).toEqual({})
    expect(check('example.com')).toEqual({})
    expect(check('localhost:3000')).toEqual({})
  })

  it('requires a value', () => {
    expect(check('')).toEqual({ url: 'Enter a URL' })
    expect(check('   ')).toEqual({ url: 'Enter a URL' })
  })

  it('rejects text that cannot be parsed as a URL', () => {
    expect(check('hello world').url).toBe('Enter a valid URL, for example https://example.com')
    expect(check('https://').url).toBe('Enter a valid URL, for example https://example.com')
  })

  it('rejects protocols other than http and https', () => {
    const message = 'URL must start with http:// or https://'
    expect(check('ftp://example.com').url).toBe(message)
    expect(check('javascript:alert(1)').url).toBe(message)
    expect(check('mailto:a@example.com').url).toBe(message)
  })
})

describe('text validation', () => {
  it('requires non-empty text', () => {
    expect(validateFields('text', { text: '' })).toEqual({ text: 'Enter some text' })
    expect(validateFields('text', { text: '  \n ' })).toEqual({ text: 'Enter some text' })
  })

  it('accepts any other text', () => {
    expect(validateFields('text', { text: 'hello' })).toEqual({})
  })
})

describe('isValidEmailAddress', () => {
  it('accepts common addresses', () => {
    expect(isValidEmailAddress('a@example.com')).toBe(true)
    expect(isValidEmailAddress('first.last+tag@mail.example.co.uk')).toBe(true)
  })

  it('rejects malformed addresses', () => {
    expect(isValidEmailAddress('plain')).toBe(false)
    expect(isValidEmailAddress('a@b')).toBe(false)
    expect(isValidEmailAddress('a@@example.com')).toBe(false)
    expect(isValidEmailAddress('a b@example.com')).toBe(false)
    expect(isValidEmailAddress('.a@example.com')).toBe(false)
    expect(isValidEmailAddress('a..b@example.com')).toBe(false)
    expect(isValidEmailAddress('a@-example.com')).toBe(false)
    expect(isValidEmailAddress('a@example..com')).toBe(false)
    expect(isValidEmailAddress(`${'a'.repeat(250)}@example.com`)).toBe(false)
  })
})

describe('email validation', () => {
  const check = (address) => validateFields('email', { address, subject: '', body: '' })

  it('requires an address', () => {
    expect(check('')).toEqual({ address: 'Enter an email address' })
  })

  it('names the problem for an invalid address', () => {
    expect(check('nope')).toEqual({ address: 'Enter a valid email address' })
  })

  it('accepts a valid address with surrounding spaces', () => {
    expect(check('  me@example.com ')).toEqual({})
  })

  it('does not require subject or body', () => {
    expect(isValid('email', { address: 'me@example.com', subject: '', body: '' })).toBe(true)
  })
})

describe('normalizePhone', () => {
  it('keeps digits only', () => {
    expect(normalizePhone('(555) 123-4567')).toBe('5551234567')
  })

  it('keeps a leading + only when it was entered', () => {
    expect(normalizePhone('+1 (555) 123-4567')).toBe('+15551234567')
    expect(normalizePhone('  +44 20 7946 0958')).toBe('+442079460958')
  })
})

describe('phone validation', () => {
  const check = (phone) => validateFields('phone', { phone })

  it('accepts digits, spaces, dashes, parentheses and a leading +', () => {
    expect(check('5551234')).toEqual({})
    expect(check('+1 (555) 123-4567')).toEqual({})
  })

  it('requires a value', () => {
    expect(check('')).toEqual({ phone: 'Enter a phone number' })
  })

  it('rejects other characters and a + that is not leading', () => {
    const message = 'Phone number can only contain digits, spaces, dashes, parentheses and a leading +'
    expect(check('555-CALL-NOW').phone).toBe(message)
    expect(check('555+1234567').phone).toBe(message)
    expect(check('555.123.4567').phone).toBe(message)
  })

  it('requires 7 to 15 digits', () => {
    const message = 'Phone number must have 7 to 15 digits'
    expect(check('123456').phone).toBe(message)
    expect(check('1234567')).toEqual({})
    expect(check('123456789012345')).toEqual({})
    expect(check('1234567890123456').phone).toBe(message)
    expect(check('+').phone).toBe(message)
  })
})

describe('wifi validation', () => {
  const wifi = (overrides) => ({
    ssid: 'Home',
    security: WIFI_SECURITY.WPA,
    password: 'password123',
    hidden: false,
    ...overrides,
  })

  it('accepts a complete WPA network', () => {
    expect(validateFields('wifi', wifi())).toEqual({})
  })

  it('requires an SSID of at most 32 characters', () => {
    expect(validateFields('wifi', wifi({ ssid: '' })).ssid).toBe('Enter the network name (SSID)')
    expect(validateFields('wifi', wifi({ ssid: '   ' })).ssid).toBe('Enter the network name (SSID)')
    expect(validateFields('wifi', wifi({ ssid: 'a'.repeat(32) }))).toEqual({})
    expect(validateFields('wifi', wifi({ ssid: 'a'.repeat(33) })).ssid).toBe(
      'Network name must be 32 characters or fewer',
    )
  })

  it('requires a WPA password of 8 to 63 characters', () => {
    const message = 'Wi-Fi password must be 8 to 63 characters'
    expect(validateFields('wifi', wifi({ password: '' })).password).toBe('Enter the Wi-Fi password')
    expect(validateFields('wifi', wifi({ password: '1234567' })).password).toBe(message)
    expect(validateFields('wifi', wifi({ password: '12345678' }))).toEqual({})
    expect(validateFields('wifi', wifi({ password: 'a'.repeat(63) }))).toEqual({})
    expect(validateFields('wifi', wifi({ password: 'a'.repeat(64) })).password).toBe(message)
  })

  it('only requires a non-empty password for WEP', () => {
    expect(validateFields('wifi', wifi({ security: WIFI_SECURITY.WEP, password: 'abc' }))).toEqual({})
    expect(validateFields('wifi', wifi({ security: WIFI_SECURITY.WEP, password: '' })).password).toBe(
      'Enter the Wi-Fi password',
    )
  })

  it('ignores the password when there is no security', () => {
    expect(validateFields('wifi', wifi({ security: WIFI_SECURITY.NONE, password: '' }))).toEqual({})
  })

  it('reports SSID and password errors together', () => {
    expect(Object.keys(validateFields('wifi', wifi({ ssid: '', password: '' })))).toEqual(['ssid', 'password'])
  })
})

describe('validateFields', () => {
  it('throws for an unknown type', () => {
    expect(() => validateFields('sms', {})).toThrow('Unknown QR type: sms')
  })
})
