/**
 * 单个标签API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - 更新标签
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser();

    const { id } = await params;
    const tagId = Number.parseInt(id, 10);
    if (Number.isNaN(tagId)) {
      return NextResponse.json({ error: '无效的标签ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, color, description } = body;

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId }
    });

    if (!existingTag) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 });
    }

    // 如果名称有变化，检查新名称是否已存在
    if (name && name.trim() !== existingTag.name) {
      const duplicateTag = await prisma.tag.findUnique({
        where: { name: name.trim() }
      });

      if (duplicateTag) {
        return NextResponse.json({ error: '标签名称已存在' }, { status: 409 });
      }
    }

    // 更新标签
    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        ...(name && { name: name.trim() }),
        ...(color && { color }),
        ...(description !== undefined && { description: description?.trim() || null })
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
        id: updatedTag.id,
        name: updatedTag.name,
        color: updatedTag.color,
        description: updatedTag.description,
        songCount: updatedTag._count.songs,
        createdAt: updatedTag.createdAt.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('更新标签失败:', error);
    return NextResponse.json(
      { error: '更新标签失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// DELETE - 删除标签
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();

    const { id } = await params;
    const tagId = Number.parseInt(id, 10);
    if (Number.isNaN(tagId)) {
      return NextResponse.json({ error: '无效的标签ID' }, { status: 400 });
    }

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: {
            songs: true
          }
        }
      }
    });

    if (!existingTag) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 });
    }

    // 删除标签（会级联删除相关的SongTag记录）
    await prisma.tag.delete({
      where: { id: tagId }
    });

    return NextResponse.json({
      success: true,
      message: `标签 "${existingTag.name}" 已删除`
    });
  } catch (error) {
    console.error('删除标签失败:', error);
    return NextResponse.json(
      { error: '删除标签失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
