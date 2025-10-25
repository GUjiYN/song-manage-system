import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleRouteError, successResponse, errorResponse } from '@/lib/http';


// 歌单类型常量
const PlaylistType = {
  NORMAL: 'NORMAL',
  FAVORITES: 'FAVORITES',
} as const;

// 获取或创建用户的喜欢歌单
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const userId = user.id;

    // 查找用户的喜欢歌单
    let favoritesPlaylist = await prisma.playlist.findFirst({
      where: {
        userId,
        type: PlaylistType.FAVORITES,
      },
      include: {
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
        user: true,
      },
    });

    // 如果不存在，创建一个
    if (!favoritesPlaylist) {
      // 先查找用户现有的歌单数量，确定新歌单的顺序
      const existingPlaylistsCount = await prisma.playlist.count({
        where: { userId },
      });

      favoritesPlaylist = await prisma.playlist.create({
        data: {
          name: '我喜欢',
          description: '我喜欢的音乐收藏',
          isPublic: false, // 喜欢歌单默认私有
          type: PlaylistType.FAVORITES,
          userId,
        },
        include: {
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
          user: true,
        },
      });
    }

    // 转换为前端格式
    const responsePlaylist = {
      id: favoritesPlaylist.id,
      name: favoritesPlaylist.name,
      description: favoritesPlaylist.description ?? null,
      coverUrl: favoritesPlaylist.cover ?? null,
      isPublic: favoritesPlaylist.isPublic,
      type: favoritesPlaylist.type as PlaylistType,
      createdAt: favoritesPlaylist.createdAt as unknown as string,
      updatedAt: favoritesPlaylist.updatedAt as unknown as string,
      creatorId: favoritesPlaylist.userId,
      creator: {
        id: favoritesPlaylist.user.id,
        email: favoritesPlaylist.user.email,
        username: favoritesPlaylist.user.username,
        name: favoritesPlaylist.user.name ?? null,
        avatar: favoritesPlaylist.user.avatar ?? null,
        role: favoritesPlaylist.user.role as unknown as 'ADMIN' | 'MANAGER' | 'USER',
      },
      _count: {
        songs: favoritesPlaylist.playlistSongs.length,
        followers: 0,
      },
      songs: favoritesPlaylist.playlistSongs.map((ps) => ({
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
      })),
    };

    return successResponse(responsePlaylist);
  } catch (error) {
    return handleRouteError(error);
  }
}