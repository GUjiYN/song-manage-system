/**
 * 歌单网格容器组件
 */

import { Playlist } from '@/types/playlist';
import { PlaylistCard } from './playlist-card';
import { PlaylistSkeleton } from './playlist-skeleton';

interface PlaylistGridProps {
  playlists: Playlist[] | undefined;
  showActions?: boolean;
  onEdit?: (playlistId: number) => void;
  onDelete?: (playlistId: number, playlistName: string) => void;
  isDeleting?: number | null;
  className?: string;
  onSelect?: (playlistId: number) => void;
}

export function PlaylistGrid({
  playlists,
  showActions = false,
  onEdit,
  onDelete,
  isDeleting = null,
  className = '',
  onSelect,
}: PlaylistGridProps) {
  // 空状态
  if (!playlists || playlists.length === 0) {
    return null; // 空状态由父组件处理
  }

  // 正常显示
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8 ${className}`}>
      {playlists.map((playlist) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          showActions={showActions}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
