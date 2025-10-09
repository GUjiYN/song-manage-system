import { NextRequest } from 'next/server';
import { UserRole } from '@/generated/prisma';
import { requireRole } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';
import { successResponse, handleRouteError, ApiError } from '@/lib/http';
import { songCreateSchema } from '@/lib/validators/admin';
import { createSong, listSongs } from '@/services/admin/song-service';

const MANAGER_ROLES = [UserRole.ADMIN, UserRole.MANAGER];

function parseOptionalInt(value: string | null, label: string) {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new ApiError(400, `无效的${label} ID`);
  }
  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(MANAGER_ROLES);

    const { searchParams } = request.nextUrl;
    const pagination = parsePagination({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });

    const search = searchParams.get('search')?.trim();
    const artistId = parseOptionalInt(searchParams.get('artistId'), '艺术家');
    const albumId = parseOptionalInt(searchParams.get('albumId'), '专辑');
    const categoryId = parseOptionalInt(searchParams.get('categoryId'), '分类');

    const result = await listSongs({
      pagination,
      search,
      artistId,
      albumId,
      categoryId,
    });

    return successResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(MANAGER_ROLES);

    const body = await request.json();
    const payload = songCreateSchema.parse(body);
    const song = await createSong(payload);
    return successResponse(song, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
