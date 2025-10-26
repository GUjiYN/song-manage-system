/**
 * 歌曲分类统计API
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

// 只有管理员和经理可以访问分类统计
const ALLOWED_ROLES = [UserRole.ADMIN, UserRole.MANAGER];

export async function GET() {
  try {
    // 验证管理员权限
    await requireRole(ALLOWED_ROLES);

    // 获取有标签的歌曲数（去重）
    const taggedSongsStats = await prisma.songTag.groupBy({
      by: ['songId'],
    });
    const taggedSongsCount = taggedSongsStats.length;

    // 获取所有标签信息
    const allTags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            songs: true
          }
        }
      }
    });

    // 计算总体统计
    const totalSongs = await prisma.song.count();
    const untaggedSongsCount = totalSongs - taggedSongsCount;

    // 处理标签统计数据
    const categoryDistribution = allTags.map(tag => ({
      name: tag.name,
      count: tag._count.songs,
      color: tag.color || '#3B82F6',
      tagId: tag.id
    }));

    // 按数量排序
    categoryDistribution.sort((a, b) => b.count - a.count);

    // 计算覆盖率
    const coverageRate = totalSongs > 0 ? (taggedSongsCount / totalSongs * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalSongs,
        taggedSongs: taggedSongsCount,
        untaggedSongs: untaggedSongsCount,
        coverageRate: Math.round(coverageRate * 100) / 100, // 保留两位小数
        categoryDistribution: categoryDistribution.slice(0, 15), // 返回前15个标签
      }
    });
  } catch (error) {
    console.error('获取歌曲分类统计失败:', error);
    return NextResponse.json(
      { error: '获取歌曲分类统计失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}