import { decodeCursor, encodeCursor, normalizeLimit } from '../src/pagination'

describe('pagination helpers', () => {
  it('encodes/decodes cursor roundtrip', () => {
    const now = new Date('2025-08-30T12:34:56.789Z').toISOString()
    const cur = encodeCursor({ id: '01JABCDEFXYZ', createdAt: now })
    const out = decodeCursor(cur)
    expect(out).toEqual({ id: '01JABCDEFXYZ', createdAt: now })
  })

  it('rejects invalid cursor', () => {
    expect(() => decodeCursor('not-base64')).toThrow('Invalid cursor')
    const bad = Buffer.from(JSON.stringify({ id: 'x' }), 'utf8').toString('base64url')
    expect(() => decodeCursor(bad)).toThrow('Invalid cursor')
  })

  it('normalizes limit with bounds', () => {
    expect(normalizeLimit(undefined)).toBe(20)
    expect(normalizeLimit('10')).toBe(10)
    expect(() => normalizeLimit(0)).toThrow()
    expect(() => normalizeLimit(101)).toThrow()
  })
})
