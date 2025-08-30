import { validateEnv } from '../src/config/config.schema'

describe('Config schema', () => {
  it('parses defaults and allowlist', () => {
    const out = validateEnv({ CORS_ALLOWLIST: 'http://a.com, https://b.org' } as any)
    expect(out.PORT).toBe(3000)
    expect(out.CORS_ORIGINS).toEqual(['http://a.com', 'https://b.org'])
  })

  it('rejects invalid port', () => {
    expect(() => validateEnv({ PORT: 'not-a-number' } as any)).toThrow()
  })

  it('throws in production when using dev default JWT secrets', () => {
    expect(() => validateEnv({ NODE_ENV: 'production' } as any)).toThrow(
      /Unsafe JWT secret configuration/,
    )
  })

  it('throws in production when one of the JWT secrets is dev default', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        JWT_SECRET: 'strong-strong-secret-123',
      } as any),
    ).toThrow(/Unsafe JWT secret configuration/)
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        JWT_REFRESH_SECRET: 'strong-strong-refresh-456',
      } as any),
    ).toThrow(/Unsafe JWT secret configuration/)
  })

  it('accepts production when both JWT secrets are strong and non-default', () => {
    const out = validateEnv({
      NODE_ENV: 'production',
      JWT_SECRET: 'strong-strong-secret-123',
      JWT_REFRESH_SECRET: 'strong-strong-refresh-456',
    } as any)
    expect(out.NODE_ENV).toBe('production')
  })
})
