import { jwtVerify, SignJWT } from 'jose';

const encoder = new TextEncoder();

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET 环境变量未配置');
  }
  return encoder.encode(secret);
}

export type JwtPayload = {
  sub: string;
  role: string;
};

export async function signJwt(payload: { userId: number; role: string }, expiresIn = '7d'): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecretKey());
  if (!payload.sub || typeof payload.role !== 'string') {
    throw new Error('无效的 Token 负载');
  }
  return {
    sub: payload.sub,
    role: payload.role,
  };
}
