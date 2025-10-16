import { NextRequest } from 'next/server';
import { getOptionalUser, requireUser } from '@/lib/auth';
import { successResponse, handleRouteError, ApiError } from '@/lib/http';
import { playlistUpdateSchema } from '@/lib/validators/playlists';
import { deletePlaylist, getPlaylistDetail, updatePlaylist } from '@/services/playlist-service';

function parsePlaylistId(param: string) {
  const id = Number(param);
  if (!Number.isInteger(id)) {
    throw new ApiError(400, '无效的歌单 ID');
  }
  return id;
}

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id: idParam } = await context.params;
    const id = parsePlaylistId(idParam);
    const [playlist, currentUser] = await Promise.all([getPlaylistDetail(id), getOptionalUser()]);

    if (!playlist.isPublic && (!currentUser || currentUser.id !== playlist.userId)) {
      throw new ApiError(403, '无权访问该歌单');
    }

    const responsePayload = {
      ...playlist,
      isOwner: currentUser ? currentUser.id === playlist.userId : false,
    };

    return successResponse(responsePayload);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const { id: idParam } = await context.params;
    const id = parsePlaylistId(idParam);

    const body = await request.json();
    const payload = playlistUpdateSchema.parse(body);
    const updated = await updatePlaylist(id, user.id, payload);
    return successResponse(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const { id: idParam } = await context.params;
    const id = parsePlaylistId(idParam);
    await deletePlaylist(id, user.id);
    return successResponse({ message: '删除成功' });
  } catch (error) {
    return handleRouteError(error);
  }
}
