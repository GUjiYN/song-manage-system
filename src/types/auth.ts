/**
 * 认证相关的类型定义
 */

// 用户角色枚举
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

// 用户信息类型
export interface User {
  id: number;
  email: string;
  username: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
}

// 登录表单数据
export interface LoginFormData {
  identifier: string; // 用户名或邮箱
  password: string;
}

// 注册表单数据
export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  name?: string;
  avatar?: string;
}

// 认证响应（用户信息）
export interface AuthResponse {
  user: User;
}

// 认证状态
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
