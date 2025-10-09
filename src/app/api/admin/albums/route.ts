import { NextRequest } from 'next/server';
import { UserRole } from '@/generated/prisma';
import { requireRole } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';
import { successResponse, handleRouteError, ApiError } from '@/lib/http';
import { albumCreateSchema } from '@/lib/validators/admin';
import { createAlbum, listAlbums } from '@/services/admin/album-service';

const MANAGER_ROLES = [UserRole.ADMIN, UserRole.MANAGER];

export async function GET(request: NextRequest) {
  try {
    await requireRole(MANAGER_ROLES);

    const { searchParams } = request.nextUrl;
    const pagination = parsePagination({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });

    const search = searchParams.get('search')?.trim();
    const artistIdParam = searchParams.get('artistId');
    const artistId = artistIdParam ? Number(artistIdParam) : null;
    if (artistIdParam && !Number.isInteger(artistId)) {
      throw new ApiError(400, '无效的艺术家 ID');
    }

    const result = await listAlbums({ pagination, search, artistId });
    return successResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(MANAGER_ROLES);

    const body = await request.json();
    const payload = albumCreateSchema.parse(body);
    const album = await createAlbum(payload);
    return successResponse(album, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
