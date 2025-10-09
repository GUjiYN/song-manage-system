import { NextRequest } from 'next/server';
import { UserRole } from '@/generated/prisma';
import { requireRole } from '@/lib/auth';
import { successResponse, handleRouteError, ApiError } from '@/lib/http';
import { artistUpdateSchema } from '@/lib/validators/admin';
import { deleteArtist, getArtistById, updateArtist } from '@/services/admin/artist-service';

const MANAGER_ROLES = [UserRole.ADMIN, UserRole.MANAGER];

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireRole(MANAGER_ROLES);
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) {
      throw new ApiError(400, '无效的艺术家 ID');
    }

    const artist = await getArtistById(id);
    return successResponse(artist);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireRole(MANAGER_ROLES);
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) {
      throw new ApiError(400, '无效的艺术家 ID');
    }

    const body = await request.json();
    const payload = artistUpdateSchema.parse(body);
    const artist = await updateArtist(id, payload);
    return successResponse(artist);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireRole(MANAGER_ROLES);
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) {
      throw new ApiError(400, '无效的艺术家 ID');
    }

    await deleteArtist(id);
    return successResponse({ message: '删除成功' });
  } catch (error) {
    return handleRouteError(error);
  }
}
