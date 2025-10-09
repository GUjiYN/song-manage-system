import { requireUser } from '@/lib/auth';
import { successResponse, handleRouteError, ApiError } from '@/lib/http';
import { removeSongFromPlaylist } from '@/services/playlist-service';

function parseId(value: string, label: string) {
  const id = Number(value);
  if (!Number.isInteger(id)) {
    throw new ApiError(400, `无效的${label} ID`);
  }
  return id;
}

export async function DELETE(_request: Request, context: { params: { id: string; songId: string } }) {
  try {
    const user = await requireUser();
    const playlistId = parseId(context.params.id, '歌单');
    const songId = parseId(context.params.songId, '歌曲');
    await removeSongFromPlaylist(playlistId, songId, user.id);
    return successResponse({ message: '移除成功' });
  } catch (error) {
    return handleRouteError(error);
  }
}
