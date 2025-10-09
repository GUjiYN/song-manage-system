import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/http';
import type { PaginationResult } from '@/lib/pagination';
import type { CategoryCreatePayload, CategoryUpdatePayload } from '@/lib/validators/admin';

const categoryInclude = {
  songs: true,
} satisfies Prisma.CategoryInclude;

export async function listCategories(params: { pagination: PaginationResult; search?: string | null }) {
  const where = params.search
    ? {
        name: {
          contains: params.search,
        },
      }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: categoryInclude,
      skip: params.pagination.skip,
      take: params.pagination.take,
    }),
    prisma.category.count({ where }),
  ]);

  return {
    items,
    page: params.pagination.page,
    pageSize: params.pagination.pageSize,
    total,
    totalPages: Math.ceil(total / params.pagination.pageSize),
  };
}

export async function createCategory(payload: CategoryCreatePayload) {
  const existing = await prisma.category.findUnique({ where: { name: payload.name }, select: { id: true } });
  if (existing) {
    throw new ApiError(409, '分类名称已存在');
  }

  return prisma.category.create({ data: payload, include: categoryInclude });
}

export async function getCategoryById(id: number) {
  const category = await prisma.category.findUnique({ where: { id }, include: categoryInclude });
  if (!category) {
    throw new ApiError(404, '分类不存在');
  }
  return category;
}

export async function updateCategory(id: number, payload: CategoryUpdatePayload) {
  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, '请求体不能为空');
  }

  return prisma.category.update({ where: { id }, data: payload, include: categoryInclude });
}

export async function deleteCategory(id: number) {
  await prisma.category.delete({ where: { id } });
}
