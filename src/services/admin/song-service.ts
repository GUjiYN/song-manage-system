import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/http';
import type { PaginationResult } from '@/lib/pagination';
import type { SongCreatePayload, SongUpdatePayload } from '@/lib/validators/admin';

/**
 * 歌曲查询默认返回关联歌手、专辑与标签
 */
const songInclude = {
  artist: true,
  album: true,
  tags: {
    include: {
      tag: true
    }
  },
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
      select: {
        id: true,
        title: true,
        duration: true,
        cover: true, // 确保包含 cover 字段
        fileUrl: true,
        lyrics: true,
        artistId: true,
        albumId: true,
        trackNumber: true,
        createdAt: true,
        updatedAt: true,
        ...songInclude, // 包含关联数据
      },
      orderBy: { createdAt: 'desc' },
      skip: params.pagination.skip,
      take: params.pagination.take,
    }),
    prisma.song.count({ where }),
  ]);

  // 映射数据库字段到前端期望的字段名
  const mappedItems = items.map(item => ({
    ...item,
    coverUrl: item.cover, // 将 cover 字段映射为 coverUrl
  }));

  return {
    items: mappedItems,
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

// 校验传入的标签是否全部存在
/**
 * 校验传入的标签是否全部存在
 */
async function ensureTagsExist(tagIds?: number[] | null) {
  if (!tagIds || tagIds.length === 0) {
    return;
  }
  const tags = await prisma.tag.findMany({
    where: { id: { in: tagIds } },
    select: { id: true },
  });
  if (tags.length !== tagIds.length) {
    throw new ApiError(400, '部分标签不存在');
  }
}

/**
 * 创建歌曲前校验所有关联数据并建立关系
 */
export async function createSong(payload: SongCreatePayload) {
  await ensureArtistExists(payload.artistId);
  await ensureAlbumExists(payload.albumId ?? null);
  await ensureTagsExist(payload.tagIds);

  const createdSong = await prisma.song.create({
    data: {
      title: payload.title,
      duration: payload.duration ?? null,
      fileUrl: payload.fileUrl,
      cover: payload.coverUrl,
      lyrics: payload.lyrics,
      artistId: payload.artistId,
      albumId: payload.albumId ?? null,
      trackNumber: payload.trackNumber ?? null,
      tags: payload.tagIds
        ? {
            create: payload.tagIds.map((tagId) => ({
              tagId,
            })),
          }
        : undefined,
    },
    select: {
      id: true,
      title: true,
      duration: true,
      cover: true,
      fileUrl: true,
      lyrics: true,
      artistId: true,
      albumId: true,
      trackNumber: true,
      createdAt: true,
      updatedAt: true,
      ...songInclude,
    },
  });

  // 映射数据库字段到前端期望的字段名
  return {
    ...createdSong,
    coverUrl: createdSong.cover, // 将 cover 字段映射为 coverUrl
  };
}

/**
 * 获取歌曲详情，附带歌单中出现的排序信息
 */
export async function getSongById(id: number) {
  const song = await prisma.song.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      duration: true,
      cover: true,
      fileUrl: true,
      lyrics: true,
      artistId: true,
      albumId: true,
      trackNumber: true,
      createdAt: true,
      updatedAt: true,
      playlistSongs: {
        select: {
          id: true,
          playlistId: true,
          order: true,
        },
      },
      ...songInclude,
    },
  });

  if (!song) {
    throw new ApiError(404, '歌曲不存在');
  }

  // 映射数据库字段到前端期望的字段名
  return {
    ...song,
    coverUrl: song.cover, // 将 cover 字段映射为 coverUrl
  };
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

  // 处理标签更新
  if (payload.tagIds !== undefined) {
    await ensureTagsExist(payload.tagIds);

    // 先删除现有关联
    await prisma.songTag.deleteMany({
      where: { songId: id }
    });

    // 创建新关联
    if (payload.tagIds.length > 0) {
      await prisma.songTag.createMany({
        data: payload.tagIds.map((tagId) => ({
          songId: id,
          tagId,
        })),
      });
    }
  }

  const updatedSong = await prisma.song.update({
    where: { id },
    data: {
      title: payload.title,
      duration: payload.duration ?? undefined,
      fileUrl: payload.fileUrl,
      cover: payload.coverUrl,
      lyrics: payload.lyrics,
      artistId: payload.artistId,
      albumId:
        payload.albumId === undefined
          ? undefined
          : payload.albumId === null
          ? null
          : payload.albumId,
      trackNumber: payload.trackNumber ?? undefined,
    },
    select: {
      id: true,
      title: true,
      duration: true,
      cover: true,
      fileUrl: true,
      lyrics: true,
      artistId: true,
      albumId: true,
      trackNumber: true,
      createdAt: true,
      updatedAt: true,
      ...songInclude,
    },
  });

  // 映射数据库字段到前端期望的字段名
  return {
    ...updatedSong,
    coverUrl: updatedSong.cover, // 将 cover 字段映射为 coverUrl
  };
}

/**
 * 直接根据主键删除歌曲
 */
export async function deleteSong(id: number) {
  await prisma.song.delete({ where: { id } });
}
