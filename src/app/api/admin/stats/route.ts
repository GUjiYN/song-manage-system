import { NextRequest } from 'next/server';
import { UserRole } from '@/generated/prisma';
import { requireRole } from '@/lib/auth';
import { successResponse, handleRouteError } from '@/lib/http';
import { getSystemStats } from '@/services/admin/stats-service';

const MANAGER_ROLES = [UserRole.ADMIN, UserRole.MANAGER];

/**
 * GET /api/admin/stats
 * 获取系统统计数据
 * 权限: ADMIN, MANAGER
 */
export async function GET(request: NextRequest) {
  try {
    // 验证权限
    await requireRole(MANAGER_ROLES);

    // 获取统计数据
    const stats = await getSystemStats();

    return successResponse(stats);
  } catch (error) {
    return handleRouteError(error);
  }
}
