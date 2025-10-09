import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/http';
import type { PaginationResult } from '@/lib/pagination';
import type { AlbumCreatePayload, AlbumUpdatePayload } from '@/lib/validators/admin';

const albumInclude = {
  artist: true,
  songs: true,
} satisfies Prisma.AlbumInclude;

type AlbumWithRelations = Prisma.AlbumGetPayload<{ include: typeof albumInclude }>;

function parseDate(value?: string | null) {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, '无效的日期格式');
  }
  return date;
}

export async function listAlbums(params: {
  pagination: PaginationResult;
  search?: string | null;
  artistId?: number | null;
}) {
  const where: Prisma.AlbumWhereInput = {};
  if (params.search) {
    where.title = {
      contains: params.search,
    };
  }

  if (params.artistId) {
    where.artistId = params.artistId;
  }

  const [items, total] = await Promise.all([
    prisma.album.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: albumInclude,
      skip: params.pagination.skip,
      take: params.pagination.take,
    }),
    prisma.album.count({ where }),
  ]);

  return {
    items,
    page: params.pagination.page,
    pageSize: params.pagination.pageSize,
    total,
    totalPages: Math.ceil(total / params.pagination.pageSize),
  };
}

export async function createAlbum(payload: AlbumCreatePayload): Promise<AlbumWithRelations> {
  const artist = await prisma.artist.findUnique({ where: { id: payload.artistId }, select: { id: true } });
  if (!artist) {
    throw new ApiError(400, '关联的艺术家不存在');
  }

  const releaseDate = parseDate(payload.releaseDate ?? undefined);

  return prisma.album.create({
    data: {
      title: payload.title,
      cover: payload.cover,
      description: payload.description,
      artistId: payload.artistId,
      releaseDate,
    },
    include: albumInclude,
  });
}

export async function getAlbumById(id: number): Promise<AlbumWithRelations> {
  const album = await prisma.album.findUnique({
    where: { id },
    include: {
      artist: true,
      songs: {
        include: {
          categories: true,
        },
      },
    },
  });

  if (!album) {
    throw new ApiError(404, '专辑不存在');
  }

  return album;
}

export async function updateAlbum(id: number, payload: AlbumUpdatePayload): Promise<AlbumWithRelations> {
  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, '请求体不能为空');
  }

  if (payload.artistId) {
    const artist = await prisma.artist.findUnique({ where: { id: payload.artistId }, select: { id: true } });
    if (!artist) {
      throw new ApiError(400, '关联的艺术家不存在');
    }
  }

  const releaseDate = parseDate(payload.releaseDate ?? undefined);

  return prisma.album.update({
    where: { id },
    data: {
      title: payload.title,
      cover: payload.cover,
      description: payload.description,
      artistId: payload.artistId,
      releaseDate,
    },
    include: albumInclude,
  });
}

export async function deleteAlbum(id: number) {
  await prisma.album.delete({ where: { id } });
}
