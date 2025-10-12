import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { successResponse, handleRouteError } from '@/lib/http';

export async function POST() {
  try {
    const response = successResponse(null);
    clearAuthCookie(response);
    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
