/**
 * 搜索相关类型定义
 */

import { Playlist } from './playlist';
import { Song, Artist, Album } from './song';

// 搜索类型
export type SearchType = 'all' | 'playlists' | 'songs' | 'artists' | 'albums';

// 搜索参数
export interface SearchParams {
  query: string;
  type?: SearchType;
  page?: number;
  limit?: number;
}

// 搜索结果项
export interface SearchResultItem {
  id: number;
  type: 'playlist' | 'song' | 'artist' | 'album';
  title: string;
  subtitle?: string;
  coverUrl?: string;
  description?: string;
  url: string;
  // 不同类型的特有字段
  creator?: {
    name: string;
    username?: string;
  };
  artist?: {
    name: string;
  };
  duration?: number;
  songCount?: number;
  createdAt?: string;
}

// 分页搜索结果
export interface SearchResults {
  items: SearchResultItem[];
  playlists: Playlist[];
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

// 搜索历史项
export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  type?: SearchType;
}

// 热门搜索项
export interface TrendingSearchItem {
  id: string;
  query: string;
  count: number;
  category?: string;
}