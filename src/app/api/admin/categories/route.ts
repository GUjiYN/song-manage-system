import { NextRequest } from 'next/server';
import { UserRole } from '@/generated/prisma';
import { requireRole } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';
import { successResponse, handleRouteError } from '@/lib/http';
import { categoryCreateSchema } from '@/lib/validators/admin';
import { createCategory, listCategories } from '@/services/admin/category-service';

const MANAGER_ROLES = [UserRole.ADMIN, UserRole.MANAGER];

export async function GET(request: NextRequest) {
  try {
    await requireRole(MANAGER_ROLES);

    const { searchParams } = request.nextUrl;
    const pagination = parsePagination({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });

    const search = searchParams.get('search')?.trim();
    const result = await listCategories({ pagination, search });
    return successResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(MANAGER_ROLES);

    const body = await request.json();
    const payload = categoryCreateSchema.parse(body);
    const category = await createCategory(payload);
    return successResponse(category, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
