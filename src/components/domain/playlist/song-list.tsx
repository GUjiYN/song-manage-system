/**
 * 歌曲列表组件
 */

import { Song } from '@/types/playlist';
import { Clock, MoreHorizontal, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SongListProps {
  songs: Song[];
  isLoading?: boolean;
  isOwner?: boolean;
  onPlaySong?: (song: Song) => void;
  onRemoveSong?: (songId: number) => void;
  className?: string;
}

// 格式化时长
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function SongList({
  songs,
  isLoading = false,
  isOwner = false,
  onPlaySong,
  onRemoveSong,
  className = ''
}: SongListProps) {
  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
            {isOwner && <div className="w-8 h-8 bg-gray-200 rounded"></div>}
          </div>
        ))}
      </div>
    );
  }

  if (!songs || songs.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 mb-2">
          <Play className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">暂无歌曲</h3>
        <p className="text-gray-500">
          {isOwner ? '点击"添加歌曲"开始添加音乐到这个歌单' : '这个歌单还没有添加任何歌曲'}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {/* 表头 */}
      <div className="flex items-center gap-4 px-4 py-2 text-sm text-gray-500 border-b">
        <div className="w-8 text-center">#</div>
        <div className="flex-1">标题</div>
        <div className="w-48">专辑</div>
        <div className="w-32">时长</div>
        {isOwner && <div className="w-8"></div>}
      </div>

      {/* 歌曲列表 */}
      {songs.map((song, index) => (
        <div
          key={song.id}
          className="group flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {/* 序号 */}
          <div className="w-8 text-center text-sm text-gray-500">
            {index + 1}
          </div>

          {/* 歌曲信息 */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">
              {song.title}
            </h4>
            <p className="text-sm text-gray-500 truncate">
              {song.artist.name}
            </p>
          </div>

          {/* 专辑信息 */}
          <div className="w-48 min-w-0 hidden sm:block">
            <p className="text-sm text-gray-600 truncate">
              {song.album.title}
            </p>
          </div>

          {/* 时长 */}
          <div className="w-32 text-sm text-gray-500">
            {formatDuration(song.duration)}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPlaySong?.(song)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Play className="w-4 h-4" />
            </Button>

            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveSong?.(song.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* 统计信息 */}
      <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-500 border-t">
        <div>
          共 {songs.length} 首歌曲
        </div>
        <div>
          总时长: {formatDuration(songs.reduce((total, song) => total + song.duration, 0))}
        </div>
      </div>
    </div>
  );
}