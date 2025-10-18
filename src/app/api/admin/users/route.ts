import { NextRequest } from 'next/server';
import { UserRole } from '@/generated/prisma';
import { requireRole } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';
import { successResponse, handleRouteError } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

const ADMIN_ROLES = [UserRole.ADMIN];

export async function GET(request: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);

    const { searchParams } = request.nextUrl;
    const pagination = parsePagination({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });

    const search = searchParams.get('search')?.trim();

    // 构建查询条件
    const where = search
      ? {
          OR: [
            { username: { contains: search } },
            { email: { contains: search } },
            { name: { contains: search } },
          ],
        }
      : {};

    // 查询用户列表
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse({
      items,
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);

    const body = await request.json();
    const { username, email, name, password, role, avatar } = body;

    // 验证必填字段
    if (!username || !email || !password) {
      throw new Error('用户名、邮箱和密码是必填项');
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new Error('邮箱已被使用');
    }

    // 创建用户
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        name: name || null,
        passwordHash: hashedPassword,
        role: role || UserRole.USER,
        avatar: avatar || null,
      },
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

    return successResponse(user, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}