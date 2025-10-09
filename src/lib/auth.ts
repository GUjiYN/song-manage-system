import 'server-only';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { UserRole } from '@/generated/prisma';
import { prisma } from './prisma';
import { verifyJwt } from './jwt';
import { ApiError } from './http';
import { AUTH_COOKIE_NAME } from './constants';

export type AuthUser = {
  id: number;
  email: string;
  username: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
};

async function fetchUserById(userId: number): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatar: true,
      role: true,
    },
  });

  return user ?? null;
}

export async function getOptionalUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyJwt(token);
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId)) {
      return null;
    }
    return await fetchUserById(userId);
  } catch (error) {
    console.warn('[AUTH] 无效的 Token', error);
    return null;
  }
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getOptionalUser();
  if (!user) {
    throw new ApiError(401, '未授权访问');
  }
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<AuthUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new ApiError(403, '权限不足');
  }
  return user;
}

export function attachAuthCookie(response: NextResponse, token: string, maxAgeSeconds = 60 * 60 * 24 * 7) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAgeSeconds,
    path: '/',
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });
}
