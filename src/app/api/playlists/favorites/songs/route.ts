import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleRouteError, successResponse, errorResponse } from '@/lib/http';

// 歌单类型常量
const PlaylistType = {
  NORMAL: 'NORMAL',
  FAVORITES: 'FAVORITES',
} as const;

interface ToggleFavoriteRequest {
  songId: number;
}

// 添加或移除歌曲到喜欢歌单（切换操作）
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const userId = user.id;
    const body: ToggleFavoriteRequest = await request.json();

    if (!body.songId || typeof body.songId !== 'number') {
      return errorResponse('歌曲ID是必需的', 400);
    }

    // 获取或创建喜欢歌单
    let favoritesPlaylist = await prisma.playlist.findFirst({
      where: {
        userId,
        type: PlaylistType.FAVORITES,
      },
    });

    if (!favoritesPlaylist) {
      favoritesPlaylist = await prisma.playlist.create({
        data: {
          name: '我喜欢',
          description: '我喜欢的音乐收藏',
          isPublic: false,
          type: PlaylistType.FAVORITES,
          userId,
        },
      });
    }

    // 检查歌曲是否已在喜欢歌单中
    const existingSong = await prisma.playlistSong.findUnique({
      where: {
        playlistId_songId: {
          playlistId: favoritesPlaylist.id,
          songId: body.songId,
        },
      },
    });

    let isAdded = false;

    if (existingSong) {
      // 如果已存在，则移除
      await prisma.playlistSong.delete({
        where: {
          id: existingSong.id,
        },
      });
      isAdded = false;
    } else {
      // 如果不存在，则添加
      // 获取当前歌单中歌曲的最大order值
      const maxOrder = await prisma.playlistSong
        .findFirst({
          where: { playlistId: favoritesPlaylist.id },
          orderBy: { order: 'desc' },
          select: { order: true },
        })
        .then((result) => result?.order ?? 0);

      await prisma.playlistSong.create({
        data: {
          playlistId: favoritesPlaylist.id,
          songId: body.songId,
          order: maxOrder + 1,
        },
      });
      isAdded = true;
    }

    // 返回更新后的状态
    return successResponse({
      isAdded,
      songId: body.songId,
      message: isAdded ? '已添加到我喜欢' : '已从我喜欢中移除',
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

// 获取喜欢歌单中的歌曲列表
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const userId = user.id;
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page') ?? '1');
    const limit = Number(searchParams.get('limit') ?? '20');

    // 获取喜欢歌单
    const favoritesPlaylist = await prisma.playlist.findFirst({
      where: {
        userId,
        type: PlaylistType.FAVORITES,
      },
    });

    if (!favoritesPlaylist) {
      return successResponse({
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // 获取歌单中的歌曲总数
    const total = await prisma.playlistSong.count({
      where: { playlistId: favoritesPlaylist.id },
    });

    // 获取分页的歌曲
    const playlistSongs = await prisma.playlistSong.findMany({
      where: { playlistId: favoritesPlaylist.id },
      include: {
        song: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
      orderBy: { order: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const songs = playlistSongs.map((ps) => ({
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
    }));

    return successResponse({
      data: songs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}