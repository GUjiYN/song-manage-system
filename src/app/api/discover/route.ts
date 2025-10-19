import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleRouteError, successResponse } from '@/lib/http';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const categoryIdStr = searchParams.get('categoryId');
    const limitSongs = Number(searchParams.get('limitSongs') ?? '10');
    const limitPlaylists = Number(searchParams.get('limitPlaylists') ?? '12');

    const categoryId = categoryIdStr ? Number(categoryIdStr) : undefined;

    const songWhere = categoryId
      ? { categories: { some: { id: categoryId } } }
      : {};

    const playlistWhere = categoryId
      ? {
          isPublic: true,
          playlistSongs: {
            some: {
              song: { categories: { some: { id: categoryId } } },
            },
          },
        }
      : { isPublic: true };

    const [songs, playlists, categories] = await Promise.all([
      prisma.song.findMany({
        where: songWhere,
        include: { artist: true, album: { include: { artist: true } }, categories: true },
        orderBy: { createdAt: 'desc' },
        take: limitSongs,
      }),
      prisma.playlist.findMany({
        where: playlistWhere,
        include: {
          user: true,
          playlistSongs: { include: { song: { include: { artist: true, album: true } } }, orderBy: { order: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        take: limitPlaylists,
      }),
      prisma.category.findMany({
        select: { id: true, name: true, color: true, _count: { select: { songs: true } } },
        orderBy: { name: 'asc' },
      }),
    ]);

    const featuredSongs = songs.map((s) => ({
      id: s.id,
      title: s.title,
      duration: s.duration,
      artistId: s.artistId,
      artist: {
        id: s.artist.id,
        name: s.artist.name,
        avatar: s.artist.avatar ?? null,
        description: s.artist.description ?? null,
        createdAt: s.artist.createdAt as unknown as string,
        updatedAt: s.artist.updatedAt as unknown as string,
      },
      albumId: s.albumId ?? 0,
      album: s.album
        ? {
            id: s.album.id,
            title: s.album.title,
            coverUrl: s.album.cover ?? null,
            releaseDate: (s.album.releaseDate as unknown as string) ?? null,
            artistId: s.album.artistId,
            artist: {
              id: s.album.artist!.id,
              name: s.album.artist!.name,
              avatar: s.album.artist!.avatar ?? null,
              description: s.album.artist!.description ?? null,
              createdAt: s.album.artist!.createdAt as unknown as string,
              updatedAt: s.album.artist!.updatedAt as unknown as string,
            },
            createdAt: s.album.createdAt as unknown as string,
            updatedAt: s.album.updatedAt as unknown as string,
          }
        : {
            id: 0,
            title: '-',
            coverUrl: null,
            releaseDate: null,
            artistId: s.artistId,
            artist: {
              id: s.artist.id,
              name: s.artist.name,
              avatar: s.artist.avatar ?? null,
              description: s.artist.description ?? null,
              createdAt: s.artist.createdAt as unknown as string,
              updatedAt: s.artist.updatedAt as unknown as string,
            },
            createdAt: s.createdAt as unknown as string,
            updatedAt: s.updatedAt as unknown as string,
          },
      createdAt: s.createdAt as unknown as string,
      updatedAt: s.updatedAt as unknown as string,
    }));

    const featuredPlaylists = playlists.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? null,
      coverUrl: p.cover ?? null,
      isPublic: p.isPublic,
      createdAt: p.createdAt as unknown as string,
      updatedAt: p.updatedAt as unknown as string,
      creatorId: p.userId,
      creator: { id: p.user.id, email: p.user.email, username: p.user.username, name: p.user.name ?? null, avatar: p.user.avatar ?? null, role: p.user.role as unknown as 'ADMIN' | 'MANAGER' | 'USER' },
      _count: { songs: p.playlistSongs.length, followers: 0 },
    }));

    const mappedCategories = categories.map((c) => ({ id: c.id, name: c.name, color: c.color, songCount: c._count.songs }));

    return successResponse({ featuredSongs, featuredPlaylists, categories: mappedCategories });
  } catch (error) {
    return handleRouteError(error);
  }
}
