import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@/generated/prisma';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, error: { message, code } }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ApiError) {
    return errorResponse(error.message, error.status, error.code);
  }

  if (error instanceof ZodError) {
    return errorResponse('请求数据格式错误', 422, 'VALIDATION_ERROR');
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return errorResponse('唯一约束冲突', 409, 'UNIQUE_CONSTRAINT');
    }
    if (error.code === 'P2025') {
      return errorResponse('资源不存在', 404, 'NOT_FOUND');
    }
  }

  console.error('[API ERROR]', error);
  return errorResponse('服务器内部错误', 500, 'INTERNAL_ERROR');
}
