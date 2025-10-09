import { clearAuthCookie } from '@/lib/auth';
import { successResponse } from '@/lib/http';

export async function POST() {
  const response = successResponse({ message: '已退出登录' });
  clearAuthCookie(response);
  return response;
}
