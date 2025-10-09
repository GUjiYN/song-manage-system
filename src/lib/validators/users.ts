import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatar: z.string().url().optional(),
});

export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;
