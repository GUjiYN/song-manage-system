import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';
import { successResponse, handleRouteError } from '@/lib/http';
import { playlistCreateSchema } from '@/lib/validators/playlists';
import { createPlaylist, listPublicPlaylists } from '@/services/playlist-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const pagination = parsePagination({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });

    const search = searchParams.get('search')?.trim();
    const result = await listPublicPlaylists({ pagination, search });
    return successResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const payload = playlistCreateSchema.parse(body);
    const playlist = await createPlaylist(user.id, payload);
    return successResponse(playlist, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
