import { describe, expect, it } from 'vitest'
import {
  WIFI_SECURITY,
  isValid,
  isValidEmailAddress,
  isValidWepKey,
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

  it('accepts a host with a dot or localhost', () => {
    expect(check('https://sub.example.co.uk/path')).toEqual({})
    expect(check('http://192.168.1.1:8080')).toEqual({})
    expect(check('http://localhost')).toEqual({})
    expect(check('LOCALHOST:5173')).toEqual({})
  })

  it('rejects single words, which have no dot in the host', () => {
    const message = 'URL needs a domain name such as example.com'
    expect(check('hello').url).toBe(message)
    expect(check('https://hello').url).toBe(message)
    expect(check('http://intranet/page').url).toBe(message)
  })

  it('rejects hosts where a dot has nothing on one side', () => {
    const message = 'URL needs a domain name such as example.com'
    expect(check('hello.').url).toBe(message)
    expect(check('.com').url).toBe(message)
    expect(check('a..b').url).toBe(message)
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

describe('isValidWepKey', () => {
  it('accepts 5 or 13 characters of any kind', () => {
    expect(isValidWepKey('pass!')).toBe(true)
    expect(isValidWepKey('thirteen-chars')).toBe(false)
    expect(isValidWepKey('thirteen-char')).toBe(true)
  })

  it('accepts 10 or 26 hex digits only', () => {
    expect(isValidWepKey('ABCDEF0123')).toBe(true)
    expect(isValidWepKey('ABCDEF012G')).toBe(false)
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

  it('requires an SSID', () => {
    expect(validateFields('wifi', wifi({ ssid: '' })).ssid).toBe('Enter the network name (SSID)')
    expect(validateFields('wifi', wifi({ ssid: '   ' })).ssid).toBe('Enter the network name (SSID)')
  })

  it('limits the SSID to 32 bytes, not 32 characters', () => {
    const message =
      'Network name must be 32 bytes or fewer (accented letters and emoji use 2 to 4 bytes each)'
    expect(validateFields('wifi', wifi({ ssid: 'a'.repeat(32) }))).toEqual({})
    expect(validateFields('wifi', wifi({ ssid: 'a'.repeat(33) })).ssid).toBe(message)
    // 16 two-byte characters are exactly 32 bytes; 17 are 34 bytes.
    expect(validateFields('wifi', wifi({ ssid: 'é'.repeat(16) }))).toEqual({})
    expect(validateFields('wifi', wifi({ ssid: 'é'.repeat(17) })).ssid).toBe(message)
    // 8 emoji are 32 bytes; 9 are 36 bytes even though 9 is far below 32 characters.
    expect(validateFields('wifi', wifi({ ssid: '😀'.repeat(8) }))).toEqual({})
    expect(validateFields('wifi', wifi({ ssid: '😀'.repeat(9) })).ssid).toBe(message)
  })

  it('requires a WPA password of 8 to 63 characters', () => {
    const message = 'Wi-Fi password must be 8 to 63 characters'
    expect(validateFields('wifi', wifi({ password: '' })).password).toBe('Enter the Wi-Fi password')
    expect(validateFields('wifi', wifi({ password: '1234567' })).password).toBe(message)
    expect(validateFields('wifi', wifi({ password: '12345678' }))).toEqual({})
    expect(validateFields('wifi', wifi({ password: 'a'.repeat(63) }))).toEqual({})
    expect(validateFields('wifi', wifi({ password: 'a'.repeat(64) })).password).toBe(message)
  })

  it('requires a WEP password of 5 or 13 characters, or 10 or 26 hex digits', () => {
    const message = 'WEP password must be 5 or 13 characters, or 10 or 26 hex digits'
    const wep = (password) => validateFields('wifi', wifi({ security: WIFI_SECURITY.WEP, password }))
    expect(wep('')).toEqual({ password: 'Enter the Wi-Fi password' })
    expect(wep('abcde')).toEqual({})
    expect(wep('abcdefghijklm')).toEqual({})
    expect(wep('0123456789')).toEqual({})
    expect(wep('0123456789abcdef0123456789')).toEqual({})
    expect(wep('abc').password).toBe(message)
    expect(wep('abcdef').password).toBe(message)
    expect(wep('0123456789a').password).toBe(message)
    expect(wep('0123456789abcdef012345678').password).toBe(message)
    expect(wep('ghijklmnop').password).toBe(message)
  })

  it('ignores the password when there is no security', () => {
    expect(validateFields('wifi', wifi({ security: WIFI_SECURITY.NONE, password: '' }))).toEqual({})
  })

  it('reports SSID and password errors together', () => {
    expect(Object.keys(validateFields('wifi', wifi({ ssid: '', password: '' })))).toEqual(['ssid', 'password'])
  })
})

describe('trimming rules', () => {
  it('treats URL, email and phone input with only spaces as empty', () => {
    expect(validateFields('url', { url: '   ' }).url).toBe('Enter a URL')
    expect(validateFields('email', { address: '   ', subject: '', body: '' }).address).toBe('Enter an email address')
    expect(validateFields('phone', { phone: '   ' }).phone).toBe('Enter a phone number')
  })

  it('accepts URL, email and phone input with surrounding spaces', () => {
    expect(validateFields('url', { url: '  example.com  ' })).toEqual({})
    expect(validateFields('email', { address: '  me@example.com  ', subject: '', body: '' })).toEqual({})
    expect(validateFields('phone', { phone: '  5551234567  ' })).toEqual({})
  })

  it('does not trim the password: spaces count toward its length', () => {
    const wpa = (password) =>
      validateFields('wifi', { ssid: 'Home', security: WIFI_SECURITY.WPA, password, hidden: false })
    expect(wpa('1234567 ')).toEqual({})
    expect(wpa('1234567').password).toBe('Wi-Fi password must be 8 to 63 characters')
  })

  it('does not trim the SSID: spaces count toward its byte limit', () => {
    const ssidErrors = (ssid) =>
      validateFields('wifi', { ssid, security: WIFI_SECURITY.NONE, password: '', hidden: false })
    expect(ssidErrors(`${'a'.repeat(31)} `)).toEqual({})
    expect(ssidErrors(`${'a'.repeat(32)} `).ssid).toContain('32 bytes')
  })
})

describe('validateFields', () => {
  it('throws for an unknown type', () => {
    expect(() => validateFields('sms', {})).toThrow('Unknown QR type: sms')
  })
})
