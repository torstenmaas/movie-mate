import { validateEnv } from '../src/config/config.schema';

describe('Config schema', () => {
  it('parses defaults and allowlist', () => {
    const out = validateEnv({ CORS_ALLOWLIST: 'http://a.com, https://b.org' } as any);
    expect(out.PORT).toBe(3000);
    expect(out.CORS_ORIGINS).toEqual(['http://a.com', 'https://b.org']);
  });

  it('rejects invalid port', () => {
    expect(() => validateEnv({ PORT: 'not-a-number' } as any)).toThrow();
  });
});

