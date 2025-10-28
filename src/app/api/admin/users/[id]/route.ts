import { NextRequest } from 'next/server';
import { UserRole } from '@/generated/prisma';
import { requireRole } from '@/lib/auth';
import { successResponse, handleRouteError } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

const ADMIN_ROLES = [UserRole.ADMIN];

type RouteParams = Promise<{ id: string }>;

function parseUserId(rawId: string) {
  const userId = Number.parseInt(rawId, 10);
  if (Number.isNaN(userId)) {
    throw new Error('Invalid user ID');
  }
  return userId;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    await requireRole(ADMIN_ROLES);

    const { id } = await params;
    const userId = parseUserId(id);

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
      throw new Error('User not found');
    }

    return successResponse(user);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    await requireRole(ADMIN_ROLES);

    const { id } = await params;
    const userId = parseUserId(id);

    const body = await request.json();
    const { username, email, name, password, role, avatar } = body;

    if (!username || !email) {
      throw new Error('Username and email are required');
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    const userWithSameUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (userWithSameUsername && userWithSameUsername.id !== userId) {
      throw new Error('Username already in use');
    }

    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail && userWithSameEmail.id !== userId) {
      throw new Error('Email already in use');
    }

    const updateData: {
      username: string;
      email: string;
      name: string | null;
      role: UserRole;
      avatar: string | null;
      passwordHash?: string;
    } = {
      username,
      email,
      name: name || null,
      role: role || UserRole.USER,
      avatar: avatar || null,
    };

    if (password && typeof password === 'string' && password.trim()) {
      updateData.passwordHash = await hashPassword(password);
    }

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
  _request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    await requireRole(ADMIN_ROLES);

    const { id } = await params;
    const userId = parseUserId(id);

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return successResponse({ message: 'User deleted' });
  } catch (error) {
    return handleRouteError(error);
  }
}
