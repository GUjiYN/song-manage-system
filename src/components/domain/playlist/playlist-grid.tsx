/**
 * 歌单网格容器组件
 */

import { Playlist } from '@/types/playlist';
import { PlaylistCard } from './playlist-card';
import { PlaylistSkeleton } from './playlist-skeleton';

interface PlaylistGridProps {
  playlists: Playlist[] | undefined;
  isLoading: boolean;
  error?: Error | null;
  emptyMessage?: string;
  className?: string;
}

export function PlaylistGrid({
  playlists,
  isLoading,
  error,
  emptyMessage = '暂无歌单',
  className = ''
}: PlaylistGridProps) {
  // 加载状态
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <PlaylistSkeleton key={index} />
        ))}
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-red-500 text-lg font-medium mb-2">加载失败</div>
        <div className="text-gray-500 text-sm">{error.message}</div>
      </div>
    );
  }

  // 空状态
  if (!playlists || playlists.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-gray-500 text-lg mb-2">{emptyMessage}</div>
        <div className="text-gray-400 text-sm">试试调整搜索条件或创建新的歌单吧</div>
      </div>
    );
  }

  // 正常显示
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {playlists.map((playlist) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
        />
      ))}
    </div>
  );
}