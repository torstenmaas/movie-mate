import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().min(5).max(254).email().transform((e) => e.trim().toLowerCase()),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof LoginSchema>;

