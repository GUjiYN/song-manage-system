import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';
import { signJwt } from '@/lib/jwt';
import { ApiError } from '@/lib/http';
import type { RegisterPayload, LoginPayload } from '@/lib/validators/auth';

/**
 * 统一规范的用户字段选择器，避免暴露密码等敏感信息
 */
const authUserSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
  avatar: true,
  role: true,
} satisfies Prisma.UserSelect;

type AuthUser = Prisma.UserGetPayload<{ select: typeof authUserSelect }>;

export type AuthResult = {
  user: AuthUser;
  token: string;
};

/**
 * 注册用户：校验唯一性、加密密码并生成令牌
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthResult> {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: payload.email }, { username: payload.username }],
    },
    select: { id: true },
  });

  if (existingUser) {
    throw new ApiError(409, '邮箱或用户名已被注册');
  }

  const passwordHash = await hashPassword(payload.password);

  const user = await prisma.user.create({
    data: {
      email: payload.email,
      username: payload.username,
      name: payload.name,
      avatar: payload.avatar,
      passwordHash,
    },
    select: authUserSelect,
  });

  const token = await signJwt({ userId: user.id, role: user.role });
  return { user, token };
}

/**
 * 登录认证：校验账号密码并签发访问令牌
 */
export async function authenticateUser(payload: LoginPayload): Promise<AuthResult> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: payload.identifier }, { username: payload.identifier }],
    },
    select: {
      ...authUserSelect,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new ApiError(401, '账号或密码错误');
  }

  const passwordValid = await verifyPassword(payload.password, user.passwordHash);
  if (!passwordValid) {
    throw new ApiError(401, '账号或密码错误');
  }

  const { passwordHash: _password, ...authUser } = user;
  const token = await signJwt({ userId: authUser.id, role: authUser.role });
  return { user: authUser, token };
}
