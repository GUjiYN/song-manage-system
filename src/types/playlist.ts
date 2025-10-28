/**
 * Playlist related type definitions.
 */

import { User } from './auth';

export interface Artist {
  id: number;
  name: string;
  avatar: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export interface Song {
  id: number;
  title: string;
  duration: string | null;
  artistId: number;
  artist: Artist;
  albumId: number;
  album: Album;
  createdAt: string;
  updatedAt: string;
}

export type PlaylistType = 'NORMAL' | 'FAVORITES';

export interface PlaylistTag {
  id: number;
  name: string;
  color?: string | null;
}

export interface Playlist {
  id: number;
  name: string;
  description: string | null;
  coverUrl: string | null;
  isPublic: boolean;
  type: PlaylistType;
  createdAt: string;
  updatedAt: string;
  creatorId: number;
  creator: User;
  tags?: PlaylistTag[];
  _count?: {
    songs: number;
    followers: number;
  };
  songs?: Song[];
  isFollowing?: boolean;
}

export interface PlaylistFormData {
  name: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  tagIds?: number[];
}

export interface PlaylistQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PlaylistsResponse extends PaginatedResponse<Playlist> {}

export interface PlaylistDetailResponse extends Playlist {}
