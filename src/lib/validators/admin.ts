import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, '无效的 ID').transform(Number),
});

export const artistCreateSchema = z.object({
  name: z.string().min(1).max(100),
  avatar: z.string().optional(), // 移除URL验证，允许相对路径
  description: z.string().max(5000).optional(),
  country: z.string().max(100).optional(),
});

export const artistUpdateSchema = artistCreateSchema.partial();

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式需为 YYYY-MM-DD');

const durationSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, '时长格式需为 mm:ss')
  .refine((value) => {
    const [minutes, seconds] = value.split(':');
    const minuteNumber = Number(minutes);
    const secondNumber = Number(seconds);
    return (
      Number.isInteger(minuteNumber) &&
      minuteNumber >= 0 &&
      Number.isInteger(secondNumber) &&
      secondNumber >= 0 &&
      secondNumber < 60
    );
  }, '秒需在 00-59 范围内');

export const albumCreateSchema = z.object({
  title: z.string().min(1).max(200),
  cover: z.string().optional(), // 移除URL验证，允许相对路径
  releaseDate: dateOnlySchema.optional(),
  description: z.string().max(5000).optional(),
  artistId: z.number().int().positive(),
});

export const albumUpdateSchema = albumCreateSchema.partial().extend({
  artistId: z.number().int().positive().optional(),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
  color: z.string().regex(/^#?[0-9a-fA-F]{3,8}$/).optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

const tagIdsSchema = z.array(z.number().int().positive()).optional();

export const songCreateSchema = z.object({
  title: z.string().min(1).max(200),
  duration: durationSchema.optional(),
  fileUrl: z.string().url().optional(),
  coverUrl: z.string().optional(), // 改为coverUrl，允许相对路径
  lyrics: z.string().optional(),
  artistId: z.number().int().positive(),
  albumId: z.number().int().positive().optional(),
  tagIds: tagIdsSchema,
  trackNumber: z.number().int().positive().optional(),
});

export const songUpdateSchema = songCreateSchema.partial().extend({
  albumId: z.number().int().positive().nullable().optional(),
  tagIds: tagIdsSchema,
});

export type ArtistCreatePayload = z.infer<typeof artistCreateSchema>;
export type ArtistUpdatePayload = z.infer<typeof artistUpdateSchema>;
export type AlbumCreatePayload = z.infer<typeof albumCreateSchema>;
export type AlbumUpdatePayload = z.infer<typeof albumUpdateSchema>;
export type CategoryCreatePayload = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdatePayload = z.infer<typeof categoryUpdateSchema>;
export type SongCreatePayload = z.infer<typeof songCreateSchema>;
export type SongUpdatePayload = z.infer<typeof songUpdateSchema>;
