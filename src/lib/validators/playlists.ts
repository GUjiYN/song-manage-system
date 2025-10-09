import { z } from 'zod';

export const playlistCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  cover: z.string().url().optional(),
  isPublic: z.boolean().optional(),
});

export const playlistUpdateSchema = playlistCreateSchema.partial();

export const playlistSongCreateSchema = z.object({
  songId: z.number().int().positive(),
  order: z.number().int().positive().optional(),
});

export type PlaylistCreatePayload = z.infer<typeof playlistCreateSchema>;
export type PlaylistUpdatePayload = z.infer<typeof playlistUpdateSchema>;
export type PlaylistSongCreatePayload = z.infer<typeof playlistSongCreateSchema>;
