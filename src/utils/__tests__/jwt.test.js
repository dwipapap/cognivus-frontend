import { describe, expect, it } from 'vitest'
import { getJwtExpiry } from '../jwt'

const encodeJwtPart = (value) => btoa(JSON.stringify(value))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/g, '')

const createJwt = (payload) => [
  encodeJwtPart({ alg: 'none', typ: 'JWT' }),
  encodeJwtPart(payload),
  'signature'
].join('.')

describe('JWT expiry utilities', () => {
  it('converts the JWT exp claim to milliseconds', () => {
    expect(getJwtExpiry(createJwt({ exp: 1782378000 }))).toBe(1782378000000)
  })

  it.each([
    null,
    '',
    'opaque-token',
    'header.invalid.signature',
    createJwt({}),
    createJwt({ exp: 'invalid' })
  ])('returns null when an expiry cannot be derived from %s', (token) => {
    expect(getJwtExpiry(token)).toBeNull()
  })
})
