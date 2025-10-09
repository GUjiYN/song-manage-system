import { NextRequest } from 'next/server';
import { attachAuthCookie } from '@/lib/auth';
import { handleRouteError, successResponse } from '@/lib/http';
import { registerSchema } from '@/lib/validators/auth';
import { registerUser } from '@/services/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = registerSchema.parse(body);

    const { user, token } = await registerUser(payload);
    const response = successResponse(user, 201);
    attachAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
