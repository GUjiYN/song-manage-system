/**
 * 最新音乐列表（发现页专用样式）
 * 两列卡片式行，左侧封面 + 标题/艺人/标签，右侧操作图标；
 * 悬浮时显示"添加到歌单"按钮。
 */

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Plus } from 'lucide-react';
import type { Song } from '@/types/playlist';
import { Button } from '@/components/ui/button';
import { PlaylistSelectDialog } from '@/components/domain/playlist/playlist-select-dialog';
import { useAuth } from '@/contexts/auth-context';
import { useFavorites } from '@/hooks/use-favorites';

interface LatestSongsListProps {
  songs: Song[];
  isLoading?: boolean;
  className?: string;
  onAddToPlaylist?: (song: Song) => void;
  onLike?: (song: Song) => void;
}

const defaultCover =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' rx='12' fill='%23eef2ff'/%3E%3Ctext x='50%25' y='52%25' text-anchor='middle' font-family='system-ui' font-size='28' fill='%237180f7'%3E🎵%3C/text%3E%3C/svg%3E";

export function LatestSongsList({
  songs,
  isLoading: propsIsLoading = false,
  className = '',
  onAddToPlaylist,
  onLike,
}: LatestSongsListProps) {
  const { user } = useAuth();
  const { toggleFavorite, isLiked, isLoading: favoritesLoading } = useFavorites({
    onSuccess: (songId, isLiked) => {
      onLike?.(songs.find(s => s.id === songId)!);
    },
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // 处理添加到歌单
  const handleAddToPlaylist = (song: Song) => {
    if (!user) {
      // 如果用户未登录，调用原有回调（显示登录提示）
      onAddToPlaylist?.(song);
      return;
    }

    setSelectedSong(song);
    setDialogOpen(true);
  };

  // 处理喜欢点击
  const handleLike = async (song: Song) => {
    await toggleFavorite(song);
  };

  // 合并加载状态
  const isLoading = propsIsLoading || favoritesLoading;

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[84px] bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!songs || songs.length === 0) {
    return <div className={`text-center text-slate-500 py-10 ${className}`}>暂无最新音乐</div>;
  }

  return (
    <>
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {songs.map((song) => (
          <div
            key={song.id}
            className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-shadow"
          >
            {/* 左侧：封面 + 标题/艺人/标签 */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                <Image
                  src={song.album?.coverUrl || defaultCover}
                  alt={song.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="font-medium text-slate-900 truncate" title={song.title}>
                    {song.title}
                  </p>
                  {/* 标签占位：根据需要映射真实标签 */}
                  <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    新歌
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  {song.artist?.name}
                  {song.album ? ` · ${song.album.title}` : ''}
                </p>
              </div>
            </div>

            {/* 右侧：操作 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLike(song)}
                className={`p-2 rounded hover:bg-transparent ${isLiked(song.id) ? "text-pink-600 hover:text-pink-700" : "text-slate-600 hover:text-pink-600"}`}
                aria-label="喜欢"
                disabled={favoritesLoading}
              >
                <Heart className={`w-4 h-4 ${isLiked(song.id) ? 'fill-current' : ''}`} />
              </button>

              {/* 悬浮显式：添加到歌单 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddToPlaylist(song)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> 添加到歌单
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 歌单选择弹窗 */}
      <PlaylistSelectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        song={selectedSong}
      />
    </>
  );
}
