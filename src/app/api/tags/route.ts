/**
 * 标签管理API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { requireUser } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - 获取所有标签
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            songs: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        description: tag.description,
        songCount: tag._count.songs,
        createdAt: tag.createdAt.toISOString().split('T')[0]
      }))
    });
  } catch (error) {
    console.error('获取标签失败:', error);
    return NextResponse.json(
      { error: '获取标签失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// POST - 创建新标签
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const body = await request.json();
    const { name, color, description } = body;

    // 验证必填字段
    if (!name || !name.trim()) {
      return NextResponse.json({ error: '标签名称不能为空' }, { status: 400 });
    }

    // 检查标签名称是否已存在
    const existingTag = await prisma.tag.findUnique({
      where: { name: name.trim() }
    });

    if (existingTag) {
      return NextResponse.json({ error: '标签名称已存在' }, { status: 409 });
    }

    // 创建标签
    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color || '#3B82F6',
        description: description?.trim() || null
      },
      include: {
        _count: {
          select: {
            songs: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        description: tag.description,
        songCount: tag._count.songs,
        createdAt: tag.createdAt.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('创建标签失败:', error);
    return NextResponse.json(
      { error: '创建标签失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}