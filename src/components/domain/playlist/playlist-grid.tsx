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
}

export function PlaylistGrid({
  playlists,
  showActions = false,
  onEdit,
  onDelete,
  isDeleting = null,
  className = ''
}: PlaylistGridProps) {
  // 空状态
  if (!playlists || playlists.length === 0) {
    return null; // 空状态由父组件处理
  }

  // 正常显示
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {playlists.map((playlist) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          showActions={showActions}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}