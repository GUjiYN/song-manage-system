/**
 * 用户管理相关的API服务
 */

const API_BASE = '/api/admin/users';

// 用户角色类型
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

// 用户类型定义
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

// 用户表单数据
export interface UserFormData {
  username: string;
  email: string;
  name?: string;
  password?: string;
  role: UserRole;
  avatar?: string;
}

// 用户查询参数
export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// 分页响应
export interface PaginatedUserResponse {
  users: AdminUser[];
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

// 通用API响应处理函数
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '请求失败');
  }

  const result = await response.json();

  // 处理标准API响应格式 { success: true, data: ... }
  if (result && typeof result === 'object' && 'success' in result) {
    if (!result.success) {
      throw new Error(result.message || '请求失败');
    }
    return result.data as T;
  }

  // 如果不是标准格式，直接返回
  return result as T;
}

/**
 * 获取用户列表
 */
export async function getUsers(params: UserQueryParams = {}): Promise<PaginatedUserResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('pageSize', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url);
  const result = await handleApiResponse<{
    items: AdminUser[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }>(response);

  return {
    users: result.items,
    page: result.page,
    limit: result.pageSize,
    totalPages: result.totalPages,
    totalCount: result.total,
  };
}

/**
 * 根据ID获取用户详情
 */
export async function getUserById(id: number): Promise<AdminUser> {
  const response = await fetch(`${API_BASE}/${id}`);
  return handleApiResponse<AdminUser>(response);
}

/**
 * 创建用户
 */
export async function createUser(data: UserFormData): Promise<AdminUser> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<AdminUser>(response);
}

/**
 * 更新用户
 */
export async function updateUser(id: number, data: UserFormData): Promise<AdminUser> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<AdminUser>(response);
}

/**
 * 删除用户
 */
export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  await handleApiResponse<{ message: string }>(response);
}