import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/http';
import type { UpdateProfilePayload } from '@/lib/validators/users';

const userSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
  avatar: true,
  role: true,
} satisfies Prisma.UserSelect;

export type UserProfile = Prisma.UserGetPayload<{ select: typeof userSelect }>;

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
