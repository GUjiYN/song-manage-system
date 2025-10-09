import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { successResponse, handleRouteError, ApiError } from '@/lib/http';
import { playlistSongCreateSchema } from '@/lib/validators/playlists';
import { addSongToPlaylist } from '@/services/playlist-service';

function parsePlaylistId(param: string) {
  const id = Number(param);
  if (!Number.isInteger(id)) {
    throw new ApiError(400, '无效的歌单 ID');
  }
  return id;
}

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const playlistId = parsePlaylistId(context.params.id);

    const body = await request.json();
    const payload = playlistSongCreateSchema.parse(body);
    const playlistSong = await addSongToPlaylist(playlistId, user.id, payload);
    return successResponse(playlistSong, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
