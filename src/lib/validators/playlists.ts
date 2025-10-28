import { z } from 'zod';

const coverSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || /^(https?:\/\/|\/)/.test(value),
    'Cover path must be a valid URL or start with /',
  );

export const playlistCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().optional(),
  cover: coverSchema.optional(),
  isPublic: z.boolean().optional(),
  tagIds: z.array(z.number().int().positive()).max(10).optional(),
});

export const playlistUpdateSchema = playlistCreateSchema.partial();

export const playlistSongCreateSchema = z.object({
  songId: z.number().int().positive(),
  order: z.number().int().positive().optional(),
});

export type PlaylistCreatePayload = z.infer<typeof playlistCreateSchema>;
export type PlaylistUpdatePayload = z.infer<typeof playlistUpdateSchema>;
export type PlaylistSongCreatePayload = z.infer<typeof playlistSongCreateSchema>;
