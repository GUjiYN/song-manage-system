import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { handleRouteError, successResponse } from '@/lib/http';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    return successResponse(user);
  } catch (error) {
    return handleRouteError(error);
  }
}
