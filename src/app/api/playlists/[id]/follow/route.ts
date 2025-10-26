import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleRouteError, successResponse, errorResponse } from '@/lib/http';

// 收藏/取消收藏歌单
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const playlistId = Number(id);

    if (!playlistId || isNaN(playlistId)) {
      return errorResponse('无效的歌单ID', 400);
    }

    // 检查歌单是否存在
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    select: { id: true, userId: true }
    });

    if (!playlist) {
      return errorResponse('歌单不存在', 404);
    }

    // 不能收藏自己的歌单
    if (playlist.userId === user.id) {
      return errorResponse('不能收藏自己的歌单', 400);
    }

    // 检查是否已经收藏
    const existingFollow = await prisma.playlistFollow.findUnique({
      where: {
        userId_playlistId: {
          userId: user.id,
          playlistId: playlistId,
        },
      },
    });

    if (existingFollow) {
      // 如果已经收藏，返回成功状态
      return successResponse({ message: '已经收藏过此歌单', isFollowing: true });
    }

    // 创建收藏记录
    await prisma.playlistFollow.create({
      data: {
        userId: user.id,
        playlistId: playlistId,
      },
    });

    return successResponse({ message: '收藏成功' });
  } catch (error) {
    return handleRouteError(error);
  }
}

// 取消收藏歌单
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const playlistId = Number(id);

    if (!playlistId || isNaN(playlistId)) {
      return errorResponse('无效的歌单ID', 400);
    }

    // 检查收藏记录是否存在
    const follow = await prisma.playlistFollow.findUnique({
      where: {
        userId_playlistId: {
          userId: user.id,
          playlistId: playlistId,
        },
      },
    });

    if (!follow) {
      return errorResponse('未收藏过此歌单', 404);
    }

    // 删除收藏记录
    await prisma.playlistFollow.delete({
      where: { id: follow.id },
    });

    return successResponse({ message: '取消收藏成功' });
  } catch (error) {
    return handleRouteError(error);
  }
}

// 获取收藏状态
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const playlistId = Number(id);

    if (!playlistId || isNaN(playlistId)) {
      return errorResponse('无效的歌单ID', 400);
    }

    // 检查是否已收藏
    const follow = await prisma.playlistFollow.findUnique({
      where: {
        userId_playlistId: {
          userId: user.id,
          playlistId: playlistId,
        },
      },
      select: { id: true },
    });

    return successResponse({
      isFollowing: !!follow,
      playlistId,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}