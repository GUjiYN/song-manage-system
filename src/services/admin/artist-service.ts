import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/http';
import type { PaginationResult } from '@/lib/pagination';
import type { ArtistCreatePayload, ArtistUpdatePayload } from '@/lib/validators/admin';

/**
 * 艺术家列表字段选择器，限定返回信息
 */
const artistSelect = {
  id: true,
  name: true,
  avatar: true,
  description: true,
  country: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      songs: true,
      albums: true,
    },
  },
} satisfies Prisma.ArtistSelect;

type Artist = Prisma.ArtistGetPayload<{ select: typeof artistSelect }>;

/**
 * 分页查询艺术家，支持名称模糊搜索
 */
export async function listArtists(params: { pagination: PaginationResult; search?: string | null }) {
  const where = params.search
    ? {
        name: {
          contains: params.search,
        },
      }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.artist.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: params.pagination.skip,
      take: params.pagination.take,
      select: artistSelect,
    }),
    prisma.artist.count({ where }),
  ]);

  return {
    items,
    page: params.pagination.page,
    pageSize: params.pagination.pageSize,
    total,
    totalPages: Math.ceil(total / params.pagination.pageSize),
  };
}

/**
 * 创建前检查名称是否已存在
 */
export async function createArtist(payload: ArtistCreatePayload): Promise<Artist> {
  const existing = await prisma.artist.findFirst({
    where: { name: payload.name },
    select: { id: true },
  });

  if (existing) {
    throw new ApiError(409, '艺术家已存在');
  }

  return prisma.artist.create({ data: payload, select: artistSelect });
}

/**
 * 获取包含专辑与歌曲的艺术家详情
 */
export async function getArtistById(id: number) {
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: {
      albums: true,
      songs: true,
    },
  });

  if (!artist) {
    throw new ApiError(404, '艺术家不存在');
  }

  return artist;
}

/**
 * 更新前校验请求体并确保目标存在
 */
export async function updateArtist(id: number, payload: ArtistUpdatePayload) {
  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, '请求体不能为空');
  }

  const existing = await prisma.artist.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, '艺术家不存在');
  }

  return prisma.artist.update({ where: { id }, data: payload, select: artistSelect });
}

/**
 * 删除前确认艺术家存在，避免静默失败
 */
export async function deleteArtist(id: number) {
  const existing = await prisma.artist.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    throw new ApiError(404, '艺术家不存在');
  }

  await prisma.artist.delete({ where: { id } });
}
