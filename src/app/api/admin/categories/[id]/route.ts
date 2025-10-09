import { NextRequest } from 'next/server';
import { UserRole } from '@/generated/prisma';
import { requireRole } from '@/lib/auth';
import { successResponse, handleRouteError, ApiError } from '@/lib/http';
import { categoryUpdateSchema } from '@/lib/validators/admin';
import { deleteCategory, getCategoryById, updateCategory } from '@/services/admin/category-service';

const MANAGER_ROLES = [UserRole.ADMIN, UserRole.MANAGER];

function parseCategoryId(param: string) {
  const id = Number(param);
  if (!Number.isInteger(id)) {
    throw new ApiError(400, '无效的分类 ID');
  }
  return id;
}

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireRole(MANAGER_ROLES);
    const id = parseCategoryId(context.params.id);

    const category = await getCategoryById(id);
    return successResponse(category);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireRole(MANAGER_ROLES);
    const id = parseCategoryId(context.params.id);

    const body = await request.json();
    const payload = categoryUpdateSchema.parse(body);
    const category = await updateCategory(id, payload);
    return successResponse(category);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireRole(MANAGER_ROLES);
    const id = parseCategoryId(context.params.id);

    await deleteCategory(id);
    return successResponse({ message: '删除成功' });
  } catch (error) {
    return handleRouteError(error);
  }
}
