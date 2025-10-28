import { NextRequest } from 'next/server';
import { getOptionalUser, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleRouteError, successResponse, errorResponse } from '@/lib/http';
import { playlistUpdateSchema } from '@/lib/validators/playlists';
import { Prisma } from '@/generated/prisma';
import { deletePlaylist as deletePlaylistService } from '@/services/playlist-service';

const playlistWithRelations = Prisma.validator<Prisma.PlaylistDefaultArgs>()({
  include: {
    user: {
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
      },
    },
    playlistSongs: {
      include: {
        song: {
          include: {
            artist: true,
            album: {
              include: {
                artist: true,
              },
            },
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    },
    playlistTags: {
      include: {
        tag: true,
      },
      orderBy: {
        tag: {
          name: 'asc',
        },
      },
    },
    _count: {
      select: {
        followers: true,
      },
    },
  },
});

type PlaylistWithRelations = Prisma.PlaylistGetPayload<typeof playlistWithRelations>;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const playlistId = Number(id);

    if (!playlistId || Number.isNaN(playlistId)) {
      return errorResponse('无效的歌单 ID', 400);
    }

    const user = await getOptionalUser();

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: playlistWithRelations.include,
    });

    if (!playlist) {
      return errorResponse('歌单不存在', 404);
    }

    let isFollowing = false;
    if (user) {
      const follow = await prisma.playlistFollow.findUnique({
        where: {
          userId_playlistId: {
            userId: user.id,
            playlistId,
          },
        },
      });
      isFollowing = Boolean(follow);
    }

    return successResponse(mapPlaylistResponse(playlist, isFollowing));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const playlistId = Number(id);

    if (!playlistId || Number.isNaN(playlistId)) {
      return errorResponse('无效的歌单 ID', 400);
    }

    const playlistOwner = await prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { userId: true },
    });

    if (!playlistOwner) {
      return errorResponse('歌单不存在', 404);
    }

    if (playlistOwner.userId !== user.id) {
      return errorResponse('仅歌单创建者可编辑', 403);
    }

    const rawBody = await request.json();
    const mergedBody = {
      ...rawBody,
      cover: rawBody?.cover ?? rawBody?.coverUrl ?? undefined,
    };

    if (typeof mergedBody.cover === 'string' && mergedBody.cover.trim() === '') {
      mergedBody.cover = undefined;
    }

    const payload = playlistUpdateSchema.parse(mergedBody);
    const normalizedTagIds =
      payload.tagIds !== undefined ? Array.from(new Set(payload.tagIds)) : undefined;

    if (normalizedTagIds && normalizedTagIds.length > 0) {
      const validTags = await prisma.tag.count({
        where: { id: { in: normalizedTagIds } },
      });
      if (validTags !== normalizedTagIds.length) {
        return errorResponse('包含无效的标签', 400);
      }
    }

    const updateData: Prisma.PlaylistUpdateInput = {};

    if (payload.name !== undefined) {
      updateData.name = payload.name;
    }
    if (payload.description !== undefined) {
      updateData.description = payload.description;
    }
    if (payload.cover !== undefined) {
      updateData.cover = payload.cover;
    }
    if (payload.isPublic !== undefined) {
      updateData.isPublic = payload.isPublic;
    }
    if (normalizedTagIds !== undefined) {
      updateData.playlistTags = {
        deleteMany: {},
        ...(normalizedTagIds.length > 0
          ? {
              create: normalizedTagIds.map((tagId) => ({ tagId })),
            }
          : {}),
      };
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('没有需要更新的内容', 400);
    }

    const updated = await prisma.playlist.update({
      where: { id: playlistId },
      data: updateData,
      include: playlistWithRelations.include,
    });

    return successResponse(mapPlaylistResponse(updated, false));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const playlistId = Number(id);

    if (!playlistId || Number.isNaN(playlistId)) {
      return errorResponse('无效的歌单 ID', 400);
    }

    await deletePlaylistService(playlistId, user.id);
    return successResponse({ message: '删除成功' });
  } catch (error) {
    return handleRouteError(error);
  }
}

function mapPlaylistResponse(playlist: PlaylistWithRelations, isFollowing: boolean) {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description ?? null,
    coverUrl: playlist.cover ?? null,
    isPublic: playlist.isPublic,
    type: playlist.type as 'NORMAL' | 'FAVORITES',
    createdAt: playlist.createdAt as unknown as string,
    updatedAt: playlist.updatedAt as unknown as string,
    creatorId: playlist.userId,
    creator: {
      id: playlist.user.id,
      email: playlist.user.email,
      username: playlist.user.username,
      name: playlist.user.name ?? null,
      avatar: playlist.user.avatar ?? null,
      role: playlist.user.role as unknown as 'ADMIN' | 'MANAGER' | 'USER',
    },
    tags: playlist.playlistTags.map(({ tag }) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color ?? null,
    })),
    _count: {
      songs: playlist.playlistSongs.length,
      followers: playlist._count.followers,
    },
    songs: playlist.playlistSongs.map((ps) => {
      const album = ps.song.album;
      const albumArtist = album && 'artist' in album ? album.artist : null;
      const fallbackArtist = ps.song.artist;
      const effectiveArtist = albumArtist ?? fallbackArtist;

      return {
        id: ps.song.id,
        title: ps.song.title,
        duration: ps.song.duration,
        artistId: ps.song.artistId,
        artist: {
          id: fallbackArtist.id,
          name: fallbackArtist.name,
          avatar: fallbackArtist.avatar ?? null,
          description: fallbackArtist.description ?? null,
          createdAt: fallbackArtist.createdAt as unknown as string,
          updatedAt: fallbackArtist.updatedAt as unknown as string,
        },
        albumId: ps.song.albumId ?? 0,
        album: album
          ? {
              id: album.id,
              title: album.title,
              coverUrl: album.cover ?? null,
              releaseDate: (album.releaseDate as unknown as string) ?? null,
              artistId: album.artistId,
              artist: {
                id: effectiveArtist.id,
                name: effectiveArtist.name,
                avatar: effectiveArtist.avatar ?? null,
                description: effectiveArtist.description ?? null,
                createdAt: effectiveArtist.createdAt as unknown as string,
                updatedAt: effectiveArtist.updatedAt as unknown as string,
              },
              createdAt: album.createdAt as unknown as string,
              updatedAt: album.updatedAt as unknown as string,
            }
          : {
              id: 0,
              title: '-',
              coverUrl: null,
              releaseDate: null,
              artistId: fallbackArtist.id,
              artist: {
                id: fallbackArtist.id,
                name: fallbackArtist.name,
                avatar: fallbackArtist.avatar ?? null,
                description: fallbackArtist.description ?? null,
                createdAt: fallbackArtist.createdAt as unknown as string,
                updatedAt: fallbackArtist.updatedAt as unknown as string,
              },
              createdAt: ps.song.createdAt as unknown as string,
              updatedAt: ps.song.updatedAt as unknown as string,
            },
        createdAt: ps.song.createdAt as unknown as string,
        updatedAt: ps.song.updatedAt as unknown as string,
        addedAt: ps.addedAt as unknown as string,
        order: ps.order,
      };
    }),
    isFollowing,
  };
}
