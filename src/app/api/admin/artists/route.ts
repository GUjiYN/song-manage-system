import { NextRequest } from 'next/server';
import { UserRole } from '@/generated/prisma';
import { requireRole } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';
import { successResponse, handleRouteError } from '@/lib/http';
import { artistCreateSchema } from '@/lib/validators/admin';
import { createArtist, listArtists } from '@/services/admin/artist-service';

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
    const result = await listArtists({ pagination, search });
    return successResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(MANAGER_ROLES);

    const body = await request.json();
    const payload = artistCreateSchema.parse(body);
    const artist = await createArtist(payload);
    return successResponse(artist, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
