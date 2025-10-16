import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/http';
import type { PaginationResult } from '@/lib/pagination';
import type {
  PlaylistCreatePayload,
  PlaylistUpdatePayload,
  PlaylistSongCreatePayload,
} from '@/lib/validators/playlists';

/**
 * 歌单查询统一包含创建者与曲目信息
 */
const playlistInclude = {
  user: {
    select: { id: true, username: true, avatar: true },
  },
  playlistSongs: {
    include: {
      song: {
        include: {
          artist: true,
          album: true,
          categories: true,
        },
      },
    },
    orderBy: { order: 'asc' },
  },
} satisfies Prisma.PlaylistInclude;

/**
 * 查询公开歌单列表，支持搜索与分页
 */
export async function listPublicPlaylists(params: { pagination: PaginationResult; search?: string | null }) {
  const where: Prisma.PlaylistWhereInput = { isPublic: true };

  if (params.search) {
    where.OR = [
      {
        name: {
          contains: params.search,
        },
      },
      {
        user: {
          username: {
            contains: params.search,
          },
        },
      },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.playlist.findMany({
      where,
      include: playlistInclude,
      orderBy: { createdAt: 'desc' },
      skip: params.pagination.skip,
      take: params.pagination.take,
    }),
    prisma.playlist.count({ where }),
  ]);

  // 字段映射：将数据库的 cover 字段映射为前端的 coverUrl
  const mappedItems = items.map(item => ({
    ...item,
    coverUrl: item.cover,
    creator: item.user,
    creatorId: item.userId,
    _count: {
      songs: item.playlistSongs.length,
      followers: 0, // TODO: 需要添加收藏功能时计算
    }
  }));

  return {
    data: mappedItems,
    pagination: {
      page: params.pagination.page,
      limit: params.pagination.pageSize,
      total,
      totalPages: Math.ceil(total / params.pagination.pageSize),
    },
  };
}

/**
 * 创建歌单并默认设定公开状态
 */
export async function createPlaylist(userId: number, payload: PlaylistCreatePayload) {
  const playlist = await prisma.playlist.create({
    data: {
      name: payload.name,
      description: payload.description,
      cover: payload.cover,
      isPublic: payload.isPublic ?? true,
      userId,
    },
    include: playlistInclude,
  });

  // 字段映射：将数据库的 cover 字段映射为前端的 coverUrl
  return {
    ...playlist,
    coverUrl: playlist.cover,
    creator: playlist.user,
    creatorId: playlist.userId,
    _count: {
      songs: playlist.playlistSongs.length,
      followers: 0, // TODO: 需要添加收藏功能时计算
    }
  };
}

/**
 * 获取指定用户创建的歌单列表
 */
export async function listUserPlaylists(userId: number) {
  return prisma.playlist.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: playlistInclude,
  });
}

/**
 * 获取单个歌单详情，未找到则抛错
 */
export async function getPlaylistDetail(id: number) {
  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: playlistInclude,
  });

  if (!playlist) {
    throw new ApiError(404, '歌单不存在');
  }

  return playlist;
}

/**
 * 校验权限和参数后更新歌单信息
 */
export async function updatePlaylist(id: number, userId: number, payload: PlaylistUpdatePayload) {
  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, '请求体不能为空');
  }

  const playlist = await prisma.playlist.findUnique({ where: { id } });
  if (!playlist) {
    throw new ApiError(404, '歌单不存在');
  }
  if (playlist.userId !== userId) {
    throw new ApiError(403, '仅歌单创建者可编辑');
  }

  return prisma.playlist.update({
    where: { id },
    data: {
      name: payload.name,
      description: payload.description,
      cover: payload.cover,
      isPublic: payload.isPublic,
    },
    include: playlistInclude,
  });
}

/**
 * 校验权限后删除歌单
 */
export async function deletePlaylist(id: number, userId: number) {
  const playlist = await prisma.playlist.findUnique({ where: { id }, select: { userId: true } });
  if (!playlist) {
    throw new ApiError(404, '歌单不存在');
  }
  if (playlist.userId !== userId) {
    throw new ApiError(403, '仅歌单创建者可删除');
  }

  await prisma.playlist.delete({ where: { id } });
}

/**
 * 在事务中校验并按顺序添加歌曲
 */
export async function addSongToPlaylist(playlistId: number, userId: number, payload: PlaylistSongCreatePayload) {
  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId }, select: { userId: true } });
  if (!playlist) {
    throw new ApiError(404, '歌单不存在');
  }
  if (playlist.userId !== userId) {
    throw new ApiError(403, '仅歌单创建者可操作');
  }

  const song = await prisma.song.findUnique({ where: { id: payload.songId }, select: { id: true } });
  if (!song) {
    throw new ApiError(404, '歌曲不存在');
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.playlistSong.findUnique({
      where: {
        playlistId_songId: {
          playlistId,
          songId: payload.songId,
        },
      },
    });

    if (existing) {
      throw new ApiError(409, '歌曲已在歌单中');
    }

    const count = await tx.playlistSong.count({ where: { playlistId } });
    const targetOrder = payload.order ?? count + 1;

    if (targetOrder < 1 || targetOrder > count + 1) {
      throw new ApiError(400, '排序位置超出范围');
    }

    await tx.playlistSong.updateMany({
      where: {
        playlistId,
        order: {
          gte: targetOrder,
        },
      },
      data: {
        order: {
          increment: 1,
        },
      },
    });

    return tx.playlistSong.create({
      data: {
        playlistId,
        songId: payload.songId,
        order: targetOrder,
      },
      include: {
        song: {
          include: {
            artist: true,
            album: true,
            categories: true,
          },
        },
      },
    });
  });
}

/**
 * 在事务中移除歌曲并调整剩余排序
 */
export async function removeSongFromPlaylist(playlistId: number, songId: number, userId: number) {
  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId }, select: { userId: true } });
  if (!playlist) {
    throw new ApiError(404, '歌单不存在');
  }
  if (playlist.userId !== userId) {
    throw new ApiError(403, '仅歌单创建者可操作');
  }

  await prisma.$transaction(async (tx) => {
    const playlistSong = await tx.playlistSong.findUnique({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });

    if (!playlistSong) {
      throw new ApiError(404, '歌曲不在该歌单中');
    }

    await tx.playlistSong.delete({ where: { id: playlistSong.id } });
    await tx.playlistSong.updateMany({
      where: {
        playlistId,
        order: {
          gt: playlistSong.order,
        },
      },
      data: {
        order: {
          decrement: 1,
        },
      },
    });
  });
}
