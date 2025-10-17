/**
 * 歌单相关的类型定义
 */

import { User } from './auth';

// 歌曲信息类型
export interface Song {
  id: number;
  title: string;
  duration: string | null; // 时长（mm:ss）
  artistId: number;
  artist: Artist;
  albumId: number;
  album: Album;
  createdAt: string;
  updatedAt: string;
}

// 歌手信息类型
export interface Artist {
  id: number;
  name: string;
  avatar: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// 专辑信息类型
export interface Album {
  id: number;
  title: string;
  coverUrl: string | null;
  releaseDate: string | null;
  artistId: number;
  artist: Artist;
  createdAt: string;
  updatedAt: string;
}

// 歌单信息类型
export interface Playlist {
  id: number;
  name: string;
  description: string | null;
  coverUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: number;
  creator: User;
  _count?: {
    songs: number; // 歌曲数量
    followers: number; // 收藏者数量
  };
  songs?: Song[]; // 歌单内的歌曲（详情页时使用）
  isFollowing?: boolean; // 当前用户是否已收藏此歌单
}

// 歌单创建/编辑表单数据
export interface PlaylistFormData {
  name: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
}

// 歌单查询参数
export interface PlaylistQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 歌单列表响应类型
export interface PlaylistsResponse extends PaginatedResponse<Playlist> {}

// 歌单详情响应类型
export interface PlaylistDetailResponse extends Playlist {}
