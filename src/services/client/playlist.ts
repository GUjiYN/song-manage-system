/**
 * 歌单相关的API服务
 */

import {
  Playlist,
  PlaylistDetailResponse,
  PlaylistFormData,
  PlaylistQueryParams,
  PlaylistsResponse
} from '@/types/playlist';

const API_BASE = '/api/playlists';

// 通用API响应处理函数
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '请求失败');
  }

  const result = await response.json();

  // 处理标准API响应格��� { success: true, data: ... }
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
 * 获取公开歌单列表
 */
export async function getPublicPlaylists(params: PlaylistQueryParams = {}): Promise<PlaylistsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url);
  return handleApiResponse<PlaylistsResponse>(response);
}

/**
 * 获取歌单详情
 */
export async function getPlaylistById(id: number): Promise<PlaylistDetailResponse> {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '获取歌单详情失败');
  }

  return handleApiResponse<PlaylistDetailResponse>(response);
}

/**
 * 创建歌单
 */
export async function createPlaylist(data: PlaylistFormData): Promise<Playlist> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<Playlist>(response);
}

/**
 * 更新歌单
 */
export async function updatePlaylist(id: number, data: PlaylistFormData): Promise<Playlist> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<Playlist>(response);
}

/**
 * 删除歌单
 */
export async function deletePlaylist(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '删除歌单失败');
  }
}

/**
 * 获取我创建的歌单
 */
export async function getMyPlaylists(params: PlaylistQueryParams = {}): Promise<PlaylistsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);

  const url = `${API_BASE}/my${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url);
  // 服务端历史实现返回 { playlists, page, limit, totalPages, totalCount }
  // 新实现返回 { data, pagination }
  const raw = await handleApiResponse<unknown>(response);

  // 旧格式判断与映射
  const isOldFormat = (v: unknown): v is { playlists: unknown[]; page?: unknown; limit?: unknown; totalPages?: unknown; totalCount?: unknown } => {
    if (!v || typeof v !== 'object') return false;
    const r = v as Record<string, unknown>;
    return Array.isArray(r.playlists);
  };

  if (isOldFormat(raw)) {
    return {
      data: (raw.playlists as unknown[] as Playlist[]),
      pagination: {
        page: Number((raw as Record<string, unknown>).page ?? params.page ?? 1),
        limit: Number((raw as Record<string, unknown>).limit ?? params.limit ?? 10),
        total: Number((raw as Record<string, unknown>).totalCount ?? 0),
        totalPages: Number((raw as Record<string, unknown>).totalPages ?? 0),
      },
    };
  }

  // 已是标准格式则直接返回
  const isNewFormat = (v: unknown): v is PlaylistsResponse => {
    if (!v || typeof v !== 'object') return false;
    const r = v as Record<string, unknown>;
    return Array.isArray(r.data as unknown[]) && !!r.pagination;
  };
  if (isNewFormat(raw)) {
    return raw;
  }

  // 容错：兜底为空列表
  return {
    data: [],
    pagination: { page: Number(params.page ?? 1), limit: Number(params.limit ?? 10), total: 0, totalPages: 0 },
  };
}

/**
 * 获取我收藏的歌单
 */
export async function getFollowedPlaylists(params: PlaylistQueryParams = {}): Promise<PlaylistsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);

  const url = `${API_BASE}/followed${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url);
  return handleApiResponse<PlaylistsResponse>(response);
}

/**
 * 收藏歌单
 */
export async function followPlaylist(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}/follow`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '收藏歌单失败');
  }
}

/**
 * 取消收藏歌单
 */
export async function unfollowPlaylist(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}/follow`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '取消收藏失败');
  }
}

/**
 * 添加歌曲到歌单
 */
export async function addSongToPlaylist(playlistId: number, songId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${playlistId}/songs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ songId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '添加歌曲到歌单失败');
  }
}

