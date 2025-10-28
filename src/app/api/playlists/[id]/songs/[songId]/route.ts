import { requireUser } from '@/lib/auth';
import { successResponse, handleRouteError, ApiError } from '@/lib/http';
import { removeSongFromPlaylist } from '@/services/playlist-service';

function parseId(value: string, label: string) {
  const id = Number(value);
  if (!Number.isInteger(id)) {
    throw new ApiError(400, `Invalid ${label} ID`);
  }
  return id;
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; songId: string }> }
) {
  try {
    const user = await requireUser();
    const { id, songId } = await context.params;
    const playlistId = parseId(id, '歌单');
    const parsedSongId = parseId(songId, '歌曲');
    await removeSongFromPlaylist(playlistId, parsedSongId, user.id);
    return successResponse({ message: '移除成功' });
  } catch (error) {
    return handleRouteError(error);
  }
}
