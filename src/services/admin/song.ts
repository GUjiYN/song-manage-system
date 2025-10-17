/**
 * 歌曲相关的管理员API服务
 */

import {
  Song,
  Album,
  Artist,
  SongFormData,
  AlbumFormData,
  ArtistFormData,
  SongQueryParams,
  AlbumQueryParams,
  ArtistQueryParams,
  PaginatedSongResponse,
  PaginatedAlbumResponse,
  PaginatedArtistResponse
} from '@/types/song';

const API_BASE = '/api/admin';

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

// ==================== 歌曲管理 ====================

/**
 * 获取歌曲列表
 */
export async function getSongs(params: SongQueryParams = {}): Promise<PaginatedSongResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.artistId) searchParams.append('artistId', params.artistId.toString());
  if (params.albumId) searchParams.append('albumId', params.albumId.toString());

  const url = `${API_BASE}/songs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url);
  return handleApiResponse<PaginatedSongResponse>(response);
}

/**
 * 根据ID获取歌曲详情
 */
export async function getSongById(id: number): Promise<Song> {
  const response = await fetch(`${API_BASE}/songs/${id}`);
  return handleApiResponse<Song>(response);
}

/**
 * 创建歌曲
 */
export async function createSong(data: SongFormData): Promise<Song> {
  const response = await fetch(`${API_BASE}/songs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<Song>(response);
}

/**
 * 更新歌曲
 */
export async function updateSong(id: number, data: SongFormData): Promise<Song> {
  const response = await fetch(`${API_BASE}/songs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<Song>(response);
}

/**
 * 删除歌曲
 */
export async function deleteSong(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/songs/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '删除歌曲失败');
  }
}

// ==================== 歌手管理 ====================

/**
 * 获取歌手列表
 */
export async function getArtists(params: ArtistQueryParams = {}): Promise<PaginatedArtistResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);

  const url = `${API_BASE}/artists${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url);
  return handleApiResponse<PaginatedArtistResponse>(response);
}

/**
 * 根据ID获取歌手详情
 */
export async function getArtistById(id: number): Promise<Artist> {
  const response = await fetch(`${API_BASE}/artists/${id}`);
  return handleApiResponse<Artist>(response);
}

/**
 * 创建歌手
 */
export async function createArtist(data: ArtistFormData): Promise<Artist> {
  const response = await fetch(`${API_BASE}/artists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<Artist>(response);
}

/**
 * 更新歌手
 */
export async function updateArtist(id: number, data: ArtistFormData): Promise<Artist> {
  const response = await fetch(`${API_BASE}/artists/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<Artist>(response);
}

/**
 * 删除歌手
 */
export async function deleteArtist(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/artists/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '删除歌手失败');
  }
}

// ==================== 专辑管理 ====================

/**
 * 获取专辑列表
 */
export async function getAlbums(params: AlbumQueryParams = {}): Promise<PaginatedAlbumResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.artistId) searchParams.append('artistId', params.artistId.toString());

  const url = `${API_BASE}/albums${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url);
  return handleApiResponse<PaginatedAlbumResponse>(response);
}

/**
 * 根据ID获取专辑详情
 */
export async function getAlbumById(id: number): Promise<Album> {
  const response = await fetch(`${API_BASE}/albums/${id}`);
  return handleApiResponse<Album>(response);
}

/**
 * 创建专辑
 */
export async function createAlbum(data: AlbumFormData): Promise<Album> {
  const response = await fetch(`${API_BASE}/albums`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<Album>(response);
}

/**
 * 更新专辑
 */
export async function updateAlbum(id: number, data: AlbumFormData): Promise<Album> {
  const response = await fetch(`${API_BASE}/albums/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<Album>(response);
}

/**
 * 删除专辑
 */
export async function deleteAlbum(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/albums/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '删除专辑失败');
  }
}