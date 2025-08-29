import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_NAME: z.string().default('movie-mate'),
  CORS_ALLOWLIST: z.string().optional().default(''),
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

