/**
 * 客户端认证 API 服务
 * 用于前端调用后端认证接口
 */

import { apiClient } from '@/lib/api-client';
import type { LoginFormData, RegisterFormData, User } from '@/types/auth';

/**
 * 登录
 * @param data 登录表单数据
 * @returns 用户信息（token 自动存储在 Cookie 中）
 */
export async function login(data: LoginFormData): Promise<User> {
  return apiClient.post<User>('/api/auth/login', data);
}

/**
 * 注册
 * @param data 注册表单数据
 * @returns 用户信息（token 自动存储在 Cookie 中）
 */
export async function register(data: RegisterFormData): Promise<User> {
  return apiClient.post<User>('/api/auth/register', data);
}

/**
 * 登出
 * 清除服务端 Cookie
 */
export async function logout(): Promise<void> {
  return apiClient.post<void>('/api/auth/logout');
}

/**
 * 获取当前用户信息
 * 用于页面加载时验证登录状态
 */
export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>('/api/auth/me');
}
