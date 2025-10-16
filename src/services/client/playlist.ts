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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '获取我的歌单失败');
  }

  return response.json();
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '获取收藏的歌单失败');
  }

  return response.json();
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