import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/http';
import type { PaginationResult } from '@/lib/pagination';
import type { SongCreatePayload, SongUpdatePayload } from '@/lib/validators/admin';

/**
 * 歌曲查询默认返回关联歌手、专辑与分类
 */
const songInclude = {
  artist: true,
  album: true,
  categories: true,
} satisfies Prisma.SongInclude;

/**
 * 分页查询歌曲，支持多条件筛选
 */
export async function listSongs(params: {
  pagination: PaginationResult;
  search?: string | null;
  artistId?: number | null;
  albumId?: number | null;
  categoryId?: number | null;
}) {
  const where: Prisma.SongWhereInput = {};

  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { artist: { name: { contains: params.search } } },
      { album: { title: { contains: params.search } } },
    ];
  }

  if (params.artistId) {
    where.artistId = params.artistId;
  }

  if (params.albumId) {
    where.albumId = params.albumId;
  }

  if (params.categoryId) {
    where.categories = {
      some: { id: params.categoryId },
    };
  }

  const [items, total] = await Promise.all([
    prisma.song.findMany({
      where,
      include: songInclude,
      orderBy: { createdAt: 'desc' },
      skip: params.pagination.skip,
      take: params.pagination.take,
    }),
    prisma.song.count({ where }),
  ]);

  return {
    items,
    page: params.pagination.page,
    pageSize: params.pagination.pageSize,
    total,
    totalPages: Math.ceil(total / params.pagination.pageSize),
  };
}

// 确认关联艺术家存在
/**
 * 确认关联艺术家存在
 */
async function ensureArtistExists(id: number) {
  const artist = await prisma.artist.findUnique({ where: { id }, select: { id: true } });
  if (!artist) {
    throw new ApiError(400, '关联的艺术家不存在');
  }
}

// 按需确认关联专辑存在
/**
 * 按需确认关联专辑存在
 */
async function ensureAlbumExists(id?: number | null) {
  if (!id) {
    return;
  }
  const album = await prisma.album.findUnique({ where: { id }, select: { id: true } });
  if (!album) {
    throw new ApiError(400, '关联的专辑不存在');
  }
}

// 校验传入的分类是否全部存在
/**
 * 校验传入的分类是否全部存在
 */
async function ensureCategoriesExist(categoryIds?: number[] | null) {
  if (!categoryIds || categoryIds.length === 0) {
    return;
  }
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true },
  });
  if (categories.length !== categoryIds.length) {
    throw new ApiError(400, '部分分类不存在');
  }
}

/**
 * 创建歌曲前校验所有关联数据并建立关系
 */
export async function createSong(payload: SongCreatePayload) {
  await ensureArtistExists(payload.artistId);
  await ensureAlbumExists(payload.albumId ?? null);
  await ensureCategoriesExist(payload.categoryIds);

  return prisma.song.create({
    data: {
      title: payload.title,
      duration: payload.duration ?? null,
      fileUrl: payload.fileUrl,
      cover: payload.cover,
      lyrics: payload.lyrics,
      artistId: payload.artistId,
      albumId: payload.albumId ?? null,
      trackNumber: payload.trackNumber ?? null,
      categories: payload.categoryIds
        ? {
            connect: payload.categoryIds.map((id) => ({ id })),
          }
        : undefined,
    },
    include: songInclude,
  });
}

/**
 * 获取歌曲详情，附带歌单中出现的排序信息
 */
export async function getSongById(id: number) {
  const song = await prisma.song.findUnique({
    where: { id },
    include: {
      ...songInclude,
      playlistSongs: {
        select: {
          id: true,
          playlistId: true,
          order: true,
        },
      },
    },
  });

  if (!song) {
    throw new ApiError(404, '歌曲不存在');
  }

  return song;
}

/**
 * 更新歌曲前校验变更内容与依赖数据
 */
export async function updateSong(id: number, payload: SongUpdatePayload) {
  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, '请求体不能为空');
  }

  const existing = await prisma.song.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, '歌曲不存在');
  }

  const targetArtistId = payload.artistId ?? existing.artistId;
  const targetAlbumId = payload.albumId === undefined ? existing.albumId : payload.albumId;

  await ensureArtistExists(targetArtistId);
  await ensureAlbumExists(targetAlbumId ?? null);
  await ensureCategoriesExist(payload.categoryIds ?? undefined);

  return prisma.song.update({
    where: { id },
    data: {
      title: payload.title,
      duration: payload.duration ?? undefined,
      fileUrl: payload.fileUrl,
      cover: payload.cover,
      lyrics: payload.lyrics,
      artistId: payload.artistId,
      albumId:
        payload.albumId === undefined
          ? undefined
          : payload.albumId === null
          ? null
          : payload.albumId,
      trackNumber: payload.trackNumber ?? undefined,
      categories:
        payload.categoryIds !== undefined
          ? {
              set: payload.categoryIds.map((categoryId) => ({ id: categoryId })),
            }
          : undefined,
    },
    include: songInclude,
  });
}

/**
 * 直接根据主键删除歌曲
 */
export async function deleteSong(id: number) {
  await prisma.song.delete({ where: { id } });
}
