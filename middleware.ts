import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

function isPublicGet(pathname: string, method: string) {
  if (method !== 'GET') {
    return false;
  }

  if (pathname === '/api/discover') {
    return true;
  }

  if (pathname === '/api/playlists') {
    return true;
  }

  if (!pathname.startsWith('/api/playlists/')) {
    return false;
  }

  const segments = pathname.split('/').filter(Boolean);
  // 期望形如 /api/playlists/:id
  if (segments.length === 3 && segments[2] !== 'my') {
    return true;
  }

  return false;
}

function buildUnauthorizedResponse(message = '未授权访问') {
  return NextResponse.json({ success: false, error: { message } }, { status: 401 });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  if (isPublicGet(pathname, request.method)) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.next();
    }

    try {
      const payload = await verifyJwt(token);
      const headers = new Headers(request.headers);
      headers.set('x-user-id', payload.sub);
      headers.set('x-user-role', payload.role);
      return NextResponse.next({ request: { headers } });
    } catch (error) {
      console.warn('[MIDDLEWARE] 无效 Token', error);
      const response = NextResponse.next();
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return buildUnauthorizedResponse();
  }

  try {
    const payload = await verifyJwt(token);
    const headers = new Headers(request.headers);
    headers.set('x-user-id', payload.sub);
    headers.set('x-user-role', payload.role);
    return NextResponse.next({ request: { headers } });
  } catch (error) {
    console.warn('[MIDDLEWARE] Token 验证失败', error);
    const response = buildUnauthorizedResponse('认证失败，请重新登录');
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
