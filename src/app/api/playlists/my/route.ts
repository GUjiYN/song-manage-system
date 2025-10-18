import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';
import { successResponse, handleRouteError } from '@/lib/http';
import { listUserPlaylists } from '@/services/playlist-service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    // 解析查询参数
    const { searchParams } = request.nextUrl;
    const pagination = parsePagination({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('limit') ?? undefined,
    });
    const search = searchParams.get('search')?.trim() || null;

    // 获取用户的歌单列表
    const result = await listUserPlaylists(user.id, { pagination, search });

    return successResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
