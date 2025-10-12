/**
 * API 客户端工具
 * 统一封装 fetch 请求，处理错误和响应格式
 */

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiClientError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions extends RequestInit {
  body?: unknown;
}

/**
 * 统一的 API 请求函数
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, ...restOptions } = options;

  const config: RequestInit = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // 自动携带 Cookie (JWT)
  };

  // 如果有 body，序列化为 JSON
  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(endpoint, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      const error = data.success === false ? data.error : { message: '请求失败' };
      throw new ApiClientError(
        error.message,
        error.code,
        response.status
      );
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // 网络错误或其他错误
    if (error instanceof Error) {
      throw new ApiClientError(error.message);
    }

    throw new ApiClientError('未知错误');
  }
}

/**
 * 导出便捷的 HTTP 方法
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
