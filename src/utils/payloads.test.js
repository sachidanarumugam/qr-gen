import { describe, expect, it } from 'vitest'
import { EMPTY_FIELDS, QR_TYPES, buildPayload, escapeWifiValue } from './payloads.js'
import { WIFI_SECURITY, isValid } from './validators.js'

describe('url payload', () => {
  it('returns the URL as typed when it has a protocol', () => {
    expect(buildPayload('url', { url: 'http://example.com/a?b=c' })).toBe('http://example.com/a?b=c')
  })

  it('prepends https:// when the protocol is missing', () => {
    expect(buildPayload('url', { url: ' example.com ' })).toBe('https://example.com')
  })

  it('returns an empty string for an invalid URL', () => {
    expect(buildPayload('url', { url: 'ftp://example.com' })).toBe('')
    expect(buildPayload('url', { url: '' })).toBe('')
  })

  it('returns an empty string for a single word, but keeps localhost', () => {
    expect(buildPayload('url', { url: 'hello' })).toBe('')
    expect(buildPayload('url', { url: 'localhost:3000' })).toBe('https://localhost:3000')
  })
})

describe('text payload', () => {
  it('encodes the text unchanged', () => {
    expect(buildPayload('text', { text: 'Hello,\nworld' })).toBe('Hello,\nworld')
  })

  it('keeps leading and trailing spaces and newlines exactly as typed', () => {
    expect(buildPayload('text', { text: '  padded text \n' })).toBe('  padded text \n')
  })

  it('returns an empty string for blank text', () => {
    expect(buildPayload('text', { text: '  ' })).toBe('')
  })
})

describe('email payload', () => {
  const email = (overrides) => ({ address: 'me@example.com', subject: '', body: '', ...overrides })

  it('omits the query when subject and body are empty', () => {
    expect(buildPayload('email', email())).toBe('mailto:me@example.com')
    expect(buildPayload('email', email({ subject: '  ', body: ' ' }))).toBe('mailto:me@example.com')
  })

  it('adds an encoded subject and body', () => {
    expect(buildPayload('email', email({ subject: 'Hi there', body: 'A & B = C?\nBye' }))).toBe(
      'mailto:me@example.com?subject=Hi%20there&body=A%20%26%20B%20%3D%20C%3F%0ABye',
    )
  })

  it('adds only the field that has a value', () => {
    expect(buildPayload('email', email({ subject: 'Only subject' }))).toBe(
      'mailto:me@example.com?subject=Only%20subject',
    )
    expect(buildPayload('email', email({ body: 'Only body' }))).toBe('mailto:me@example.com?body=Only%20body')
  })

  it('trims the address, subject and body', () => {
    expect(buildPayload('email', email({ address: '  me@example.com ', subject: ' Hi ', body: '\nBye\n' }))).toBe(
      'mailto:me@example.com?subject=Hi&body=Bye',
    )
  })

  it('returns an empty string for an invalid address', () => {
    expect(buildPayload('email', email({ address: 'nope' }))).toBe('')
  })
})

describe('phone payload', () => {
  it('uses digits only when no + was entered', () => {
    expect(buildPayload('phone', { phone: '(555) 123-4567' })).toBe('tel:5551234567')
  })

  it('keeps the + when it was entered', () => {
    expect(buildPayload('phone', { phone: '+1 555 123 4567' })).toBe('tel:+15551234567')
  })

  it('trims the phone number', () => {
    expect(buildPayload('phone', { phone: '   +1 555 123 4567  ' })).toBe('tel:+15551234567')
  })

  it('returns an empty string for an invalid number', () => {
    expect(buildPayload('phone', { phone: '123' })).toBe('')
  })
})

describe('escapeWifiValue', () => {
  it('escapes backslash, semicolon, comma, colon and double quote', () => {
    expect(escapeWifiValue('a\\b;c,d:e"f')).toBe('a\\\\b\\;c\\,d\\:e\\"f')
  })

  it('leaves other characters alone', () => {
    expect(escapeWifiValue("My Wi-Fi's #1")).toBe("My Wi-Fi's #1")
  })
})

describe('wifi payload', () => {
  const wifi = (overrides) => ({
    ssid: 'Home',
    security: WIFI_SECURITY.WPA,
    password: 'password123',
    hidden: false,
    ...overrides,
  })

  it('builds a WPA payload', () => {
    expect(buildPayload('wifi', wifi())).toBe('WIFI:T:WPA;S:Home;P:password123;;')
  })

  it('adds H:true only for hidden networks', () => {
    expect(buildPayload('wifi', wifi({ hidden: true }))).toBe('WIFI:T:WPA;S:Home;P:password123;H:true;;')
  })

  it('builds a WEP payload', () => {
    expect(buildPayload('wifi', wifi({ security: WIFI_SECURITY.WEP, password: 'abcde' }))).toBe(
      'WIFI:T:WEP;S:Home;P:abcde;;',
    )
  })

  it('returns an empty string for a WEP password with an invalid length', () => {
    expect(buildPayload('wifi', wifi({ security: WIFI_SECURITY.WEP, password: 'abc' }))).toBe('')
  })

  it('returns an empty string for an SSID over 32 bytes', () => {
    expect(buildPayload('wifi', wifi({ ssid: '😀'.repeat(9) }))).toBe('')
    expect(buildPayload('wifi', wifi({ ssid: '😀'.repeat(8) }))).toBe(`WIFI:T:WPA;S:${'😀'.repeat(8)};P:password123;;`)
  })

  it('keeps spaces in the SSID and password exactly as typed', () => {
    expect(buildPayload('wifi', wifi({ ssid: ' My Wi-Fi ', password: ' pass word ' }))).toBe(
      'WIFI:T:WPA;S: My Wi-Fi ;P: pass word ;;',
    )
  })

  it('omits the password for open networks', () => {
    expect(buildPayload('wifi', wifi({ security: WIFI_SECURITY.NONE, password: 'ignored' }))).toBe(
      'WIFI:T:nopass;S:Home;;',
    )
    expect(buildPayload('wifi', wifi({ security: WIFI_SECURITY.NONE, hidden: true }))).toBe(
      'WIFI:T:nopass;S:Home;H:true;;',
    )
  })

  it('escapes special characters in the SSID and password', () => {
    expect(buildPayload('wifi', wifi({ ssid: 'a;b:c', password: 'p"w\\d,1234' }))).toBe(
      'WIFI:T:WPA;S:a\\;b\\:c;P:p\\"w\\\\d\\,1234;;',
    )
  })

  it('returns an empty string for invalid input', () => {
    expect(buildPayload('wifi', wifi({ password: 'short' }))).toBe('')
    expect(buildPayload('wifi', wifi({ ssid: '' }))).toBe('')
  })
})

describe('type definitions', () => {
  it('has empty fields for every type', () => {
    expect(QR_TYPES.map((type) => type.id).sort()).toEqual(Object.keys(EMPTY_FIELDS).sort())
  })

  it('starts every type as invalid, so no QR code shows on first load', () => {
    for (const { id } of QR_TYPES) {
      expect(isValid(id, EMPTY_FIELDS[id])).toBe(false)
    }
  })
})

describe('buildPayload', () => {
  it('throws for an unknown type', () => {
    expect(() => buildPayload('sms', {})).toThrow('Unknown QR type: sms')
  })
})
