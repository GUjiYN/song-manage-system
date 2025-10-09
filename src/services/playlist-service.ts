import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/http';
import type { PaginationResult } from '@/lib/pagination';
import type {
  PlaylistCreatePayload,
  PlaylistUpdatePayload,
  PlaylistSongCreatePayload,
} from '@/lib/validators/playlists';

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

  return {
    items,
    page: params.pagination.page,
    pageSize: params.pagination.pageSize,
    total,
    totalPages: Math.ceil(total / params.pagination.pageSize),
  };
}

export async function createPlaylist(userId: number, payload: PlaylistCreatePayload) {
  return prisma.playlist.create({
    data: {
      name: payload.name,
      description: payload.description,
      cover: payload.cover,
      isPublic: payload.isPublic ?? true,
      userId,
    },
    include: playlistInclude,
  });
}

export async function listUserPlaylists(userId: number) {
  return prisma.playlist.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: playlistInclude,
  });
}

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
