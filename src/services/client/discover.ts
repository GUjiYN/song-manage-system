import { Playlist } from '@/types/playlist';
import type { Song } from '@/types/playlist';

export interface DiscoverCategory {
  id: number;
  name: string;
  color?: string | null;
  songCount: number;
}

export interface DiscoverData {
  featuredSongs: Song[];
  featuredPlaylists: Playlist[];
  categories: DiscoverCategory[];
}

function normalize<T>(result: unknown): T {
  if (result && typeof result === 'object' && 'success' in result) {
    const obj = result as { success: boolean; data: T };
    return obj.data as T;
  }
  return result as T;
}

export async function getDiscoverData(params: { categoryId?: number; limitSongs?: number; limitPlaylists?: number } = {}): Promise<DiscoverData> {
  const search = new URLSearchParams();
  if (params.categoryId) search.set('categoryId', String(params.categoryId));
  if (params.limitSongs) search.set('limitSongs', String(params.limitSongs));
  if (params.limitPlaylists) search.set('limitPlaylists', String(params.limitPlaylists));
  const url = `/api/discover${search.toString() ? `?${search.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? '加载发现数据失败');
  }
  const json = await res.json();
  return normalize<DiscoverData>(json);
}
