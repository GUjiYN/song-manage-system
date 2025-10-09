import { NextRequest } from 'next/server';
import { UserRole } from '@/generated/prisma';
import { requireRole } from '@/lib/auth';
import { successResponse, handleRouteError, ApiError } from '@/lib/http';
import { albumUpdateSchema } from '@/lib/validators/admin';
import { deleteAlbum, getAlbumById, updateAlbum } from '@/services/admin/album-service';

const MANAGER_ROLES = [UserRole.ADMIN, UserRole.MANAGER];

function parseAlbumId(param: string) {
  const id = Number(param);
  if (!Number.isInteger(id)) {
    throw new ApiError(400, '无效的专辑 ID');
  }
  return id;
}

function parseDateString(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, '无效的日期格式');
  }
  return date;
}

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireRole(MANAGER_ROLES);
    const id = parseAlbumId(context.params.id);
    const album = await getAlbumById(id);
    return successResponse(album);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireRole(MANAGER_ROLES);
    const id = parseAlbumId(context.params.id);

    const body = await request.json();
    const payload = albumUpdateSchema.parse(body);
    const album = await updateAlbum(id, payload);
    return successResponse(album);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireRole(MANAGER_ROLES);
    const id = parseAlbumId(context.params.id);
    await deleteAlbum(id);
    return successResponse({ message: '删除成功' });
  } catch (error) {
    return handleRouteError(error);
  }
}
