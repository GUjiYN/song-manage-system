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

type AdminArtist = {
  id: number;
  name: string;
  avatar: string | null;
  description: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    songs: number;
    albums: number;
  };
};

type AdminAlbum = {
  id: number;
  title: string;
  cover: string | null;
  releaseDate: string | null;
  artistId: number;
  createdAt: string;
  updatedAt: string;
  artist?: AdminArtist | null;
  songs?: unknown[]; // 服务端返回的完整歌曲数组
  _count?: {
    songs?: number;
  };
};

type AdminSong = {
  id: number;
  title: string;
  duration: string | null;
  cover: string | null;
  fileUrl: string | null;
  lyrics: string | null;
  artistId: number;
  albumId: number | null;
  createdAt: string;
  updatedAt: string;
  artist?: AdminArtist | null;
  album?: AdminAlbum | null;
  tags?: Array<{
    tag: {
      id: number;
      name: string;
      color?: string | null;
      description?: string | null;
    };
  }>;
};

type PaginatedAdminResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function normalizeArtist(artist: AdminArtist): Artist {
  return {
    id: artist.id,
    name: artist.name,
    avatar: artist.avatar ?? undefined,
    bio: artist.description ?? undefined,
    createdAt: artist.createdAt,
    updatedAt: artist.updatedAt,
    _count: artist._count
      ? {
          songs: artist._count.songs,
          albums: artist._count.albums,
        }
      : undefined,
  };
}

function normalizeAlbum(album?: AdminAlbum | null): Album | undefined {
  if (!album) {
    return undefined;
  }

  // 计算歌曲数量，优先使用 _count，否则使用 songs 数组长度
  const songCount = album._count?.songs ?? album.songs?.length;

  return {
    id: album.id,
    name: album.title,
    coverUrl: album.cover ?? undefined,
    releaseDate: album.releaseDate,
    artistId: album.artistId,
    createdAt: album.createdAt,
    updatedAt: album.updatedAt,
    artist: album.artist ? normalizeArtist(album.artist) : undefined,
    _count: songCount !== undefined ? { songs: songCount } : undefined,
  };
}

function normalizeSong(song: AdminSong): Song {
  return {
    id: song.id,
    title: song.title,
    duration: song.duration ?? null,
    coverUrl: song.cover ?? undefined,
    fileUrl: song.fileUrl ?? undefined,
    albumId: song.albumId ?? null,
    artistId: song.artistId,
    createdAt: song.createdAt,
    updatedAt: song.updatedAt,
    artist: song.artist ? normalizeArtist(song.artist) : undefined,
    album: normalizeAlbum(song.album),
    categories: song.tags ? song.tags.map(songTag => ({
      id: songTag.tag.id,
      name: songTag.tag.name,
      color: songTag.tag.color || undefined,
      description: songTag.tag.description || undefined,
    })) : undefined,
  };
}

// ==================== 歌曲管理 ====================

/**
 * 获取歌曲列表
 */
export async function getSongs(params: SongQueryParams = {}): Promise<PaginatedSongResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('pageSize', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.artistId) searchParams.append('artistId', params.artistId.toString());
  if (params.albumId) searchParams.append('albumId', params.albumId.toString());

  const url = `${API_BASE}/songs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url);
  const result = await handleApiResponse<PaginatedAdminResponse<AdminSong>>(response);

  return {
    songs: result.items.map(normalizeSong),
    page: result.page,
    limit: result.pageSize,
    totalPages: result.totalPages,
    totalCount: result.total,
  };
}

/**
 * 根据ID获取歌曲详情
 */
export async function getSongById(id: number): Promise<Song> {
  const response = await fetch(`${API_BASE}/songs/${id}`);
  const result = await handleApiResponse<AdminSong>(response);
  return normalizeSong(result);
}

/**
 * 创建歌曲
 */
export async function createSong(data: SongFormData): Promise<Song> {
  const payload = {
    title: data.title,
    duration: data.duration?.trim() || undefined,
    fileUrl: data.fileUrl?.trim() || undefined,
    cover: data.coverUrl?.trim() || undefined,
    artistId: data.artistId,
    albumId: data.albumId || undefined,
    tagIds: data.tagIds,
  };

  const response = await fetch(`${API_BASE}/songs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await handleApiResponse<AdminSong>(response);
  return normalizeSong(result);
}

/**
 * 更新歌曲
 */
export async function updateSong(id: number, data: SongFormData): Promise<Song> {
  const payload = {
    title: data.title,
    duration: data.duration?.trim() || undefined,
    fileUrl: data.fileUrl?.trim() || undefined,
    cover: data.coverUrl?.trim() || undefined,
    artistId: data.artistId,
    albumId: data.albumId || undefined,
    tagIds: data.tagIds,
  };

  const response = await fetch(`${API_BASE}/songs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await handleApiResponse<AdminSong>(response);
  return normalizeSong(result);
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
  if (params.limit) searchParams.append('pageSize', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);

  const url = `${API_BASE}/artists${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url);
  const result = await handleApiResponse<PaginatedAdminResponse<AdminArtist>>(response);

  return {
    artists: result.items.map(normalizeArtist),
    page: result.page,
    limit: result.pageSize,
    totalPages: result.totalPages,
    totalCount: result.total,
  };
}

/**
 * 根据ID获取歌手详情
 */
export async function getArtistById(id: number): Promise<Artist> {
  const response = await fetch(`${API_BASE}/artists/${id}`);
  const result = await handleApiResponse<AdminArtist>(response);
  return normalizeArtist(result);
}

/**
 * 创建歌手
 */
export async function createArtist(data: ArtistFormData): Promise<Artist> {
  const payload = {
    name: data.name,
    avatar: data.avatar?.trim() || undefined,
    description: data.bio?.trim() || undefined,
  };

  const response = await fetch(`${API_BASE}/artists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await handleApiResponse<AdminArtist>(response);
  return normalizeArtist(result);
}

/**
 * 更新歌手
 */
export async function updateArtist(id: number, data: ArtistFormData): Promise<Artist> {
  const payload = {
    name: data.name,
    avatar: data.avatar?.trim() || undefined,
    description: data.bio?.trim() || undefined,
  };

  const response = await fetch(`${API_BASE}/artists/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await handleApiResponse<AdminArtist>(response);
  return normalizeArtist(result);
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
  if (params.limit) searchParams.append('pageSize', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.artistId) searchParams.append('artistId', params.artistId.toString());

  const url = `${API_BASE}/albums${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url);
  const result = await handleApiResponse<PaginatedAdminResponse<AdminAlbum>>(response);

  return {
    albums: result.items.map(album => normalizeAlbum(album)!),
    page: result.page,
    limit: result.pageSize,
    totalPages: result.totalPages,
    totalCount: result.total,
  };
}

/**
 * 根据ID获取专辑详情
 */
export async function getAlbumById(id: number): Promise<Album> {
  const response = await fetch(`${API_BASE}/albums/${id}`);
  const result = await handleApiResponse<AdminAlbum>(response);
  const normalized = normalizeAlbum(result);
  if (!normalized) {
    throw new Error('专辑数据无效');
  }
  return normalized;
}

/**
 * 创建专辑
 */
export async function createAlbum(data: AlbumFormData): Promise<Album> {
  const payload = {
    title: data.name,
    cover: data.coverUrl?.trim() || undefined,
    releaseDate: data.releaseDate?.trim() || undefined,
    artistId: data.artistId,
  };

  const response = await fetch(`${API_BASE}/albums`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await handleApiResponse<AdminAlbum>(response);
  const normalized = normalizeAlbum(result);
  if (!normalized) {
    throw new Error('创建的专辑数据无效');
  }
  return normalized;
}

/**
 * 更新专辑
 */
export async function updateAlbum(id: number, data: AlbumFormData): Promise<Album> {
  const payload = {
    title: data.name,
    cover: data.coverUrl?.trim() || undefined,
    releaseDate: data.releaseDate?.trim() || undefined,
    artistId: data.artistId,
  };

  const response = await fetch(`${API_BASE}/albums/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await handleApiResponse<AdminAlbum>(response);
  const normalized = normalizeAlbum(result);
  if (!normalized) {
    throw new Error('更新的专辑数据无效');
  }
  return normalized;
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
