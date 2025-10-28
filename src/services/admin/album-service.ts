import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/http';
import type { PaginationResult } from '@/lib/pagination';
import type { AlbumCreatePayload, AlbumUpdatePayload } from '@/lib/validators/admin';

/**
 * 涓撹緫鏌ヨ榛樿杩斿洖鍏宠仈鑹烘湳瀹朵笌姝屾洸
 */
const albumInclude = {
  artist: true,
  songs: true,
} satisfies Prisma.AlbumInclude;

type AlbumWithRelations = Prisma.AlbumGetPayload<{ include: typeof albumInclude }>;

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 灏?YYYY-MM-DD 瀛楃涓茶В鏋愪负鏃ユ湡瀵硅薄锛圲TC 闆剁偣锛夊苟鏍￠獙鏈夋晥鎬?
 */
function parseDate(value?: string | null) {
  if (!value) {
    return undefined;
  }
  if (!DATE_ONLY_REGEX.test(value)) {
    throw new ApiError(400, 'Invalid date format, expected YYYY-MM-DD');
  }
  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    throw new ApiError(400, 'Invalid date');
  }
  return date;
}

/**
 * 鍒嗛〉鏌ヨ涓撹緫锛屾敮鎸佸悕绉版悳绱笌鑹烘湳瀹剁瓫閫?
 */
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
      select: {
        id: true,
        title: true,
        cover: true, // 纭繚鍖呭惈 cover 瀛楁
        description: true,
        artistId: true,
        releaseDate: true,
        createdAt: true,
        updatedAt: true,
        ...albumInclude, // 鍖呭惈鍏宠仈鏁版嵁
      },
      orderBy: { createdAt: 'desc' },
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

/**
 * 鍒涘缓涓撹緫鍓嶆牎楠屽叧鑱旇壓鏈骞惰В鏋愬彂甯冩棩鏈?
 */
export async function createAlbum(payload: AlbumCreatePayload): Promise<AlbumWithRelations> {
  const artist = await prisma.artist.findUnique({ where: { id: payload.artistId }, select: { id: true } });
  if (!artist) {
    throw new ApiError(400, 'Artist does not exist');
  }

  const releaseDate = parseDate(payload.releaseDate ?? undefined);

  const createdAlbum = await prisma.album.create({
    data: {
      title: payload.title,
      cover: payload.cover,
      description: payload.description,
      artistId: payload.artistId,
      releaseDate,
    },
    select: {
      id: true,
      title: true,
      cover: true,
      description: true,
      artistId: true,
      releaseDate: true,
      createdAt: true,
      updatedAt: true,
      ...albumInclude,
    },
  });

  return createdAlbum;
}

/**
 * 鑾峰彇涓撹緫璇︽儏锛屽寘鍚瓕鏇蹭笌鑹烘湳瀹朵俊鎭?
 */
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
    throw new ApiError(404, 'Album not found');
  }

  return album;
}

/**
 * 鏍￠獙璇锋眰浣撲笌鍏宠仈鏁版嵁鍚庢洿鏂颁笓杈?
 */
export async function updateAlbum(id: number, payload: AlbumUpdatePayload): Promise<AlbumWithRelations> {
  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, 'Request body cannot be empty');
  }
  if (payload.artistId) {
    const artist = await prisma.artist.findUnique({ where: { id: payload.artistId }, select: { id: true } });
    if (!artist) {
      throw new ApiError(400, 'Artist does not exist');
    }
  }
  // Only include defined fields to avoid passing undefined to Prisma
  const data: Prisma.AlbumUpdateInput = {};
  if (payload.title !== undefined) data.title = payload.title;
  if (payload.cover !== undefined) data.cover = payload.cover;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.artistId !== undefined) data.artistId = payload.artistId;
  if (payload.releaseDate !== undefined) {
    data.releaseDate = parseDate(payload.releaseDate);
  }
  const updatedAlbum = await prisma.album.update({
    where: { id },
    data,
    select: {
      id: true,
      title: true,
      cover: true,
      description: true,
      artistId: true,
      releaseDate: true,
      createdAt: true,
      updatedAt: true,
      ...albumInclude,
    },
  });
  return updatedAlbum;
}

/**
 * 鐩存帴鎸変富閿垹闄や笓杈戣褰?
 */
export async function deleteAlbum(id: number) {
  await prisma.album.delete({ where: { id } });
}




