import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_NAME: z.string().default('movie-mate'),
  CORS_ALLOWLIST: z.string().optional().default(''),
  ENABLE_SWAGGER: z.string().optional().default('false'),
  LOG_LEVEL: z.string().optional().default('info'),
  SENTRY_DSN: z.string().optional().default(''),
  SENTRY_TRACES_SAMPLE_RATE: z.string().optional().default('0.1'),
  SENTRY_PROFILES_SAMPLE_RATE: z.string().optional().default('0'),
  SENTRY_VERIFY_SETUP: z.string().optional().default('false'),
  IMAGE_COMMIT: z.string().optional().default(''),
  JWT_SECRET: z.string().min(10).optional().default('dev-secret-change-me'),
  JWT_EXPIRES_IN: z.string().optional().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(10).optional().default('dev-refresh-secret-change-me'),
  JWT_REFRESH_EXPIRES_IN: z.string().optional().default('30d'),
  REFRESH_TOKEN_COOKIE: z.string().optional().default('false'),
  REFRESH_COOKIE_NAME: z.string().optional().default('refreshToken'),
  CSRF_COOKIE_NAME: z.string().optional().default('csrfToken'),
  CSRF_HEADER_NAME: z.string().optional().default('x-csrf-token'),
  COOKIE_SECURE: z.string().optional().default('false'),
  COOKIE_DOMAIN: z.string().optional().default(''),
})

export type AppEnv = z.infer<typeof EnvSchema> & {
  CORS_ORIGINS: string[]
}

export function validateEnv(raw: Record<string, unknown>) {
  const parsed = EnvSchema.safeParse(raw)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
    throw new Error(`Invalid environment configuration: ${issues}`)
  }
  // Production guard against dev default JWT secrets
  if (parsed.data.NODE_ENV === 'production') {
    if (
      parsed.data.JWT_SECRET === 'dev-secret-change-me' ||
      parsed.data.JWT_REFRESH_SECRET === 'dev-refresh-secret-change-me'
    ) {
      throw new Error(
        'Unsafe JWT secret configuration in production. Please set strong JWT secrets. See docs/ops-secrets.md.',
      )
    }
    // Cookie mode must use secure cookies in production
    if (parsed.data.REFRESH_TOKEN_COOKIE === 'true' && parsed.data.COOKIE_SECURE !== 'true') {
      throw new Error(
        'Cookie mode in production requires COOKIE_SECURE=true. See docs/backend-overview.md.',
      )
    }
  }
  const cors = (parsed.data.CORS_ALLOWLIST || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return { ...parsed.data, CORS_ORIGINS: cors } satisfies AppEnv
}
