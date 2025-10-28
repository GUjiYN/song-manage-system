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
    return errorResponse('Request validation error', 422, 'VALIDATION_ERROR');
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    return errorResponse('Request validation error', 422, 'VALIDATION_ERROR');
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return errorResponse('Unique constraint violation', 409, 'UNIQUE_CONSTRAINT');
    }
    if (error.code === 'P2025') {
      return errorResponse('Resource not found', 404, 'NOT_FOUND');
    }
  }
  console.error('[API ERROR]', error);
  return errorResponse('Internal server error', 500, 'INTERNAL_ERROR');
}


