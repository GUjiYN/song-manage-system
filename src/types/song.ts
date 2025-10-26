/**
 * 歌曲相关类型定义
 */

export interface Song {
  id: number;
  title: string;
  duration: string | null; // 时长（mm:ss）
  coverUrl?: string;
  fileUrl?: string;
  albumId: number | null;
  artistId: number;
  createdAt: string;
  updatedAt: string;

  // 关联数据
  album?: Album;
  artist?: Artist;
  categories?: Category[]; // 歌曲的分类标签
}

// 分类标签类型
export interface Category {
  id: number;
  name: string;
  color?: string;
  description?: string;
}

export interface Album {
  id: number;
  name: string;
  coverUrl?: string;
  releaseDate?: string | null;
  artistId: number;
  createdAt: string;
  updatedAt: string;

  // 关联数据
  artist?: Artist;
  _count?: {
    songs: number;
  };
}

export interface Artist {
  id: number;
  name: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;

  // 关联数据
  _count?: {
    songs: number;
    albums: number;
  };
}

// 表单数据类型
export interface SongFormData {
  title: string;
  duration?: string;
  coverUrl?: string;
  fileUrl?: string;
  albumId: number | null;
  artistId: number;
  tagIds?: number[]; // 新增标签选择
}

export interface AlbumFormData {
  name: string;
  coverUrl?: string;
  releaseDate?: string;
  artistId: number;
}

export interface ArtistFormData {
  name: string;
  avatar?: string;
  bio?: string;
}

// 查询参数类型
export interface SongQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  artistId?: number;
  albumId?: number;
}

export interface AlbumQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  artistId?: number;
}

export interface ArtistQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// 分页响应类型
export interface PaginatedSongResponse {
  songs: Song[];
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

export interface PaginatedAlbumResponse {
  albums: Album[];
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

export interface PaginatedArtistResponse {
  artists: Artist[];
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}
