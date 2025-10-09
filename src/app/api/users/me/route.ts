import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { successResponse, handleRouteError } from '@/lib/http';
import { updateProfileSchema } from '@/lib/validators/users';
import { updateUserProfile } from '@/services/user-service';

export async function GET() {
  try {
    const user = await requireUser();
    return successResponse(user);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const payload = updateProfileSchema.parse(body);
    const updated = await updateUserProfile(user.id, payload);
    return successResponse(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
