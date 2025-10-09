import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/http';
import type { PaginationResult } from '@/lib/pagination';
import type { CategoryCreatePayload, CategoryUpdatePayload } from '@/lib/validators/admin';

/**
 * 分类查询时默认加载关联歌曲
 */
const categoryInclude = {
  songs: true,
} satisfies Prisma.CategoryInclude;

/**
 * 分页查询分类，支持名称模糊搜索
 */
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

/**
 * 创建分类前校验名称唯一性
 */
export async function createCategory(payload: CategoryCreatePayload) {
  const existing = await prisma.category.findUnique({ where: { name: payload.name }, select: { id: true } });
  if (existing) {
    throw new ApiError(409, '分类名称已存在');
  }

  return prisma.category.create({ data: payload, include: categoryInclude });
}

/**
 * 获取分类详情，包含关联歌曲
 */
export async function getCategoryById(id: number) {
  const category = await prisma.category.findUnique({ where: { id }, include: categoryInclude });
  if (!category) {
    throw new ApiError(404, '分类不存在');
  }
  return category;
}

/**
 * 校验请求体后更新分类信息
 */
export async function updateCategory(id: number, payload: CategoryUpdatePayload) {
  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, '请求体不能为空');
  }

  return prisma.category.update({ where: { id }, data: payload, include: categoryInclude });
}

/**
 * 按主键删除分类
 */
export async function deleteCategory(id: number) {
  await prisma.category.delete({ where: { id } });
}
