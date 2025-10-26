import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleRouteError, successResponse, errorResponse } from '@/lib/http';

// 获取歌单详情
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const playlistId = Number(id);

    if (!playlistId || isNaN(playlistId)) {
      return errorResponse('无效的歌单ID', 400);
    }

    // 获取当前用户（可选）
    const user = await getOptionalUser();

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
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
                album: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    if (!playlist) {
      return errorResponse('歌单不存在', 404);
    }

    // 检查当前用户是否收藏此歌单
    let isFollowing = false;
    if (user) {
      const follow = await prisma.playlistFollow.findUnique({
        where: {
          userId_playlistId: {
            userId: user.id,
            playlistId: playlistId,
          },
        },
      });
      isFollowing = !!follow;
    }

    // 转换为前端格式
    const responsePlaylist = {
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
      _count: {
        songs: playlist.playlistSongs.length,
        followers: playlist._count.followers,
      },
      songs: playlist.playlistSongs.map((ps) => ({
        id: ps.song.id,
        title: ps.song.title,
        duration: ps.song.duration,
        artistId: ps.song.artistId,
        artist: {
          id: ps.song.artist.id,
          name: ps.song.artist.name,
          avatar: ps.song.artist.avatar ?? null,
          description: ps.song.artist.description ?? null,
          createdAt: ps.song.artist.createdAt as unknown as string,
          updatedAt: ps.song.artist.updatedAt as unknown as string,
        },
        albumId: ps.song.albumId ?? 0,
        album: ps.song.album
          ? {
              id: ps.song.album.id,
              title: ps.song.album.title,
              coverUrl: ps.song.album.cover ?? null,
              releaseDate: (ps.song.album.releaseDate as unknown as string) ?? null,
              artistId: ps.song.album.artistId,
              artist: {
                id: ps.song.album.artist?.id ?? ps.song.artist.id,
                name: ps.song.album.artist?.name ?? ps.song.artist.name,
                avatar: ps.song.album.artist?.avatar ?? null,
                description: ps.song.album.artist?.description ?? null,
                createdAt: ps.song.album.artist?.createdAt as unknown as string ?? ps.song.artist.createdAt,
                updatedAt: ps.song.album.artist?.updatedAt as unknown as string ?? ps.song.artist.updatedAt,
              },
              createdAt: ps.song.album.createdAt as unknown as string,
              updatedAt: ps.song.album.updatedAt as unknown as string,
            }
          : {
              id: 0,
              title: '-',
              coverUrl: null,
              releaseDate: null,
              artistId: ps.song.artistId,
              artist: {
                id: ps.song.artist.id,
                name: ps.song.artist.name,
                avatar: ps.song.artist.avatar ?? null,
                description: ps.song.artist.description ?? null,
                createdAt: ps.song.artist.createdAt as unknown as string,
                updatedAt: ps.song.artist.updatedAt as unknown as string,
              },
              createdAt: ps.song.createdAt as unknown as string,
              updatedAt: ps.song.updatedAt as unknown as string,
            },
        createdAt: ps.song.createdAt as unknown as string,
        updatedAt: ps.song.updatedAt as unknown as string,
        addedAt: ps.addedAt as unknown as string,
        order: ps.order,
      })),
      isFollowing,
    };

    return successResponse(responsePlaylist);
  } catch (error) {
    return handleRouteError(error);
  }
}

// 辅助函数：获取可选用户
async function getOptionalUser() {
  try {
    return await requireUser();
  } catch {
    return null;
  }
}