import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(128),
  name: z.string().min(1).max(50).optional(),
  avatar: z.string().url().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(6).max(128),
});

export type RegisterPayload = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
