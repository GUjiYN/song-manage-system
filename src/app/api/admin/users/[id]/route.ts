import { NextRequest } from 'next/server';
import { UserRole } from '@/generated/prisma';
import { requireRole } from '@/lib/auth';
import { successResponse, handleRouteError } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

const ADMIN_ROLES = [UserRole.ADMIN];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(ADMIN_ROLES);

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      throw new Error('无效的用户ID');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return successResponse(user);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(ADMIN_ROLES);

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      throw new Error('无效的用户ID');
    }

    const body = await request.json();
    const { username, email, name, password, role, avatar } = body;

    // 验证必填字段
    if (!username || !email) {
      throw new Error('用户名和邮箱是必填项');
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('用户不存在');
    }

    // 检查用户名是否被其他用户使用
    const userWithSameUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (userWithSameUsername && userWithSameUsername.id !== userId) {
      throw new Error('用户名已被使用');
    }

    // 检查邮箱是否被其他用户使用
    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail && userWithSameEmail.id !== userId) {
      throw new Error('邮箱已被使用');
    }

    // 构建更新数据
    const updateData: any = {
      username,
      email,
      name: name || null,
      role: role || UserRole.USER,
      avatar: avatar || null,
    };

    // 如果提供了新密码，则更新密码
    if (password && password.trim()) {
      updateData.passwordHash = await hashPassword(password);
    }

    // 更新用户
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(user);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(ADMIN_ROLES);

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      throw new Error('无效的用户ID');
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('用户不存在');
    }

    // 删除用户
    await prisma.user.delete({
      where: { id: userId },
    });

    return successResponse({ message: '用户已删除' });
  } catch (error) {
    return handleRouteError(error);
  }
}