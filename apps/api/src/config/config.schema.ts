import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_NAME: z.string().default('movie-mate'),
  CORS_ALLOWLIST: z.string().optional().default(''),
  ENABLE_SWAGGER: z.string().optional().default('false'),
  LOG_LEVEL: z.string().optional().default('info'),
  SENTRY_DSN: z.string().optional().default(''),
  JWT_SECRET: z.string().min(10).optional().default('dev-secret-change-me'),
  JWT_EXPIRES_IN: z.string().optional().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(10).optional().default('dev-refresh-secret-change-me'),
  JWT_REFRESH_EXPIRES_IN: z.string().optional().default('30d'),
});

export type AppEnv = z.infer<typeof EnvSchema> & {
  CORS_ORIGINS: string[];
};

export function validateEnv(raw: Record<string, unknown>) {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  const cors = (parsed.data.CORS_ALLOWLIST || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return { ...parsed.data, CORS_ORIGINS: cors } satisfies AppEnv;
}
