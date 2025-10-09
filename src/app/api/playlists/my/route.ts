import { requireUser } from '@/lib/auth';
import { successResponse, handleRouteError } from '@/lib/http';
import { listUserPlaylists } from '@/services/playlist-service';

export async function GET() {
  try {
    const user = await requireUser();
    const playlists = await listUserPlaylists(user.id);

    return successResponse(playlists);
  } catch (error) {
    return handleRouteError(error);
  }
}
