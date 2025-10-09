import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/http';
import type { UpdateProfilePayload } from '@/lib/validators/users';

/**
 * 用户数据选择器，限制返回基础公开字段
 */
const userSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
  avatar: true,
  role: true,
} satisfies Prisma.UserSelect;

export type UserProfile = Prisma.UserGetPayload<{ select: typeof userSelect }>;

// 更新个人资料前校验请求体非空
/**
 * 更新个人资料前校验请求体非空
 */
export async function updateUserProfile(userId: number, payload: UpdateProfilePayload): Promise<UserProfile> {
  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, '请求体不能为空');
  }

  return prisma.user.update({
    where: { id: userId },
    data: payload,
    select: userSelect,
  });
}
