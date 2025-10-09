import { NextRequest } from 'next/server';
import { UserRole } from '@/generated/prisma';
import { requireRole } from '@/lib/auth';
import { successResponse, handleRouteError, ApiError } from '@/lib/http';
import { songUpdateSchema } from '@/lib/validators/admin';
import { deleteSong, getSongById, updateSong } from '@/services/admin/song-service';

const MANAGER_ROLES = [UserRole.ADMIN, UserRole.MANAGER];

function parseSongId(param: string) {
  const id = Number(param);
  if (!Number.isInteger(id)) {
    throw new ApiError(400, '无效的歌曲 ID');
  }
  return id;
}

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireRole(MANAGER_ROLES);
    const id = parseSongId(context.params.id);
    const song = await getSongById(id);
    return successResponse(song);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireRole(MANAGER_ROLES);
    const id = parseSongId(context.params.id);

    const body = await request.json();
    const payload = songUpdateSchema.parse(body);
    const song = await updateSong(id, payload);
    return successResponse(song);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireRole(MANAGER_ROLES);
    const id = parseSongId(context.params.id);
    await deleteSong(id);
    return successResponse({ message: '删除成功' });
  } catch (error) {
    return handleRouteError(error);
  }
}
