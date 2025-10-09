import { NextRequest } from 'next/server';
import { attachAuthCookie } from '@/lib/auth';
import { handleRouteError, successResponse } from '@/lib/http';
import { loginSchema } from '@/lib/validators/auth';
import { authenticateUser } from '@/services/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = loginSchema.parse(body);

    const { user, token } = await authenticateUser(payload);
    const response = successResponse(user);
    attachAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
