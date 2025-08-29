import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().min(5).max(254).email().transform((e) => e.trim().toLowerCase()),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(72, 'Password must be at most 72 characters')
    .refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /[0-9]/.test(v), {
      message: 'Password must contain lower, upper case letters and digits',
    }),
  displayName: z.string().min(2).max(50).transform((s) => s.trim()),
  preferredLocale: z.enum(['de', 'en']).optional().default('de'),
  acceptTerms: z.literal(true, { message: 'Terms must be accepted' }),
  marketingOptIn: z.boolean().optional().default(false),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
