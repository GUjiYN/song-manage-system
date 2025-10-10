import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/http';
import type { PaginationResult } from '@/lib/pagination';
import type { AlbumCreatePayload, AlbumUpdatePayload } from '@/lib/validators/admin';

/**
 * 专辑查询默认返回关联艺术家与歌曲
 */
const albumInclude = {
  artist: true,
  songs: true,
} satisfies Prisma.AlbumInclude;

type AlbumWithRelations = Prisma.AlbumGetPayload<{ include: typeof albumInclude }>;

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 将 YYYY-MM-DD 字符串解析为日期对象（UTC 零点）并校验有效性
 */
function parseDate(value?: string | null) {
  if (!value) {
    return undefined;
  }

  if (!DATE_ONLY_REGEX.test(value)) {
    throw new ApiError(400, '日期格式需为 YYYY-MM-DD');
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
    throw new ApiError(400, '无效的日期值');
  }

  return date;
}

/**
 * 分页查询专辑，支持名称搜索与艺术家筛选
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

/**
 * 创建专辑前校验关联艺术家并解析发布日期
 */
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

/**
 * 获取专辑详情，包含歌曲与艺术家信息
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
    throw new ApiError(404, '专辑不存在');
  }

  return album;
}

/**
 * 校验请求体与关联数据后更新专辑
 */
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

/**
 * 直接按主键删除专辑记录
 */
export async function deleteAlbum(id: number) {
  await prisma.album.delete({ where: { id } });
}
