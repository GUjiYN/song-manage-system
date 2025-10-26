import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parsePagination } from '@/lib/pagination';
import { successResponse, handleRouteError } from '@/lib/http';

// 获取用户收藏的歌单列表
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = request.nextUrl;
    const pagination = parsePagination({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? searchParams.get('limit') ?? undefined,
    });

    const search = searchParams.get('search')?.trim();

    // 构建查询条件
    const where = {
      userId: user.id,
      playlist: {
        isPublic: true,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }),
      },
    };

    // 获取收藏的歌单总数
    const total = await prisma.playlistFollow.count({
      where,
    });

    // 获取收藏的歌单列表
    const follows = await prisma.playlistFollow.findMany({
      where,
      include: {
        playlist: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
    });

    // 转换为前端格式
    const playlists = follows.map((follow) => ({
      id: follow.playlist.id,
      name: follow.playlist.name,
      description: follow.playlist.description ?? null,
      coverUrl: follow.playlist.cover ?? null,
      isPublic: follow.playlist.isPublic,
      type: follow.playlist.type as 'NORMAL' | 'FAVORITES',
      createdAt: follow.playlist.createdAt as unknown as string,
      updatedAt: follow.playlist.updatedAt as unknown as string,
      creatorId: follow.playlist.userId,
      creator: {
        id: follow.playlist.user.id,
        email: follow.playlist.user.email,
        username: follow.playlist.user.username,
        name: follow.playlist.user.name ?? null,
        avatar: follow.playlist.user.avatar ?? null,
        role: 'USER' as const, // 简化处理
      },
      _count: {
        songs: 0, // TODO: 计算歌曲数量
        followers: 1, // 当前用户收藏，至少有1个收藏者
      },
      isFollowing: true,
      followedAt: follow.createdAt as unknown as string,
    }));

    const result = {
      data: playlists,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };

    return successResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}