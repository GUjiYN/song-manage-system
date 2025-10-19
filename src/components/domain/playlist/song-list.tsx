/**
 * 歌曲列表组件（统一样式：与 PlaylistDetailInline 对齐的表格风格）
 */

import { Song } from '@/types/playlist';
import { Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SongListProps {
  songs: Song[];
  isLoading?: boolean;
  isOwner?: boolean;
  onPlaySong?: (song: Song) => void;
  onRemoveSong?: (songId: number) => void;
  className?: string;
}

// 工具：格式化秒为 mm:ss
function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 工具：解析时长字符串为秒（支持 mm:ss 或纯数字秒）
function parseDurationToSeconds(value?: string | null): number {
  if (!value) return 0;
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):([0-5]\d)$/);
  if (match) {
    const minutes = Number(match[1]);
    const seconds = Number(match[2]);
    return minutes * 60 + seconds;
  }
  const numeric = Number(trimmed);
  if (Number.isFinite(numeric) && numeric >= 0) return Math.floor(numeric);
  return 0;
}

// 对外：规范化展示的时长
function formatDuration(value?: string | null): string {
  if (!value) return '--:--';
  const trimmed = value.trim();
  if (/^\d{1,2}:[0-5]\d$/.test(trimmed)) return trimmed;
  const seconds = parseDurationToSeconds(trimmed);
  if (seconds === 0) return trimmed;
  return formatSeconds(seconds);
}

export function SongList({
  songs,
  isLoading = false,
  isOwner = false,
  onPlaySong,
  onRemoveSong,
  className = '',
}: SongListProps) {
  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-10 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!songs || songs.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <h3 className="text-lg font-medium text-slate-900 mb-1">暂无歌曲</h3>
        <p className="text-slate-500">
          {isOwner ? '点击“添加歌曲”开始添加音乐到这个歌单' : '这个歌单还没有添加任何歌曲'}
        </p>
      </div>
    );
  }

  // 与 PlaylistDetailInline 对齐的列布局
  const gridCols = isOwner
    ? 'grid grid-cols-[56px_1fr_1fr_72px_48px]'
    : 'grid grid-cols-[56px_1fr_1fr_72px]';

  return (
    <div className={`space-y-1 ${className}`}>
      {/* 表头 */}
      <div className={`${gridCols} px-2 text-slate-500 text-xs font-medium gap-2 h-8 items-center`}>
        <div className="pl-3">#</div>
        <div>标题</div>
        <div>专辑</div>
        <div className="text-right pr-3">时长</div>
        {isOwner && <div className="text-right pr-3">操作</div>}
      </div>
      <div className="border-t border-slate-200" />

      {/* 列表行 */}
      {songs.map((song, index) => (
        <div
          key={song.id}
          className={`${gridCols} gap-2 items-center h-14 hover:bg-slate-50 transition-colors border-b border-slate-100 group`}
        >
          {/* 序号 */}
          <div className="pl-3 text-slate-400 text-sm tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </div>

          {/* 歌曲信息 */}
          <div className="min-w-0 flex items-center gap-3">
            {/* 预留小封面位（未来可显示音轨或专辑封面）*/}
            <div className="w-10 h-10 rounded bg-slate-200 overflow-hidden flex-shrink-0 hidden" />
            <div className="min-w-0">
              <p className="text-slate-900 truncate">{song.title}</p>
              <p className="text-slate-500 text-xs truncate">{song.artist.name}</p>
            </div>
          </div>

          {/* 专辑信息 */}
          <div className="text-slate-600 truncate">{song.album.title}</div>

          {/* 时长 */}
          <div className="text-right pr-3 text-slate-500 text-sm tabular-nums">
            {formatDuration(song.duration)}
          </div>

          {/* 操作列（仅拥有者显示）*/}
          {isOwner && (
            <div className="text-right pr-3 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPlaySong?.(song)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Play className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveSong?.(song.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* 统计信息 */}
      <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-500">
        <div>共 {songs.length} 首歌曲</div>
        <div>
          总时长 {(() => {
            const totalSeconds = songs.reduce((total, song) => total + parseDurationToSeconds(song.duration), 0);
            return totalSeconds > 0 ? formatSeconds(totalSeconds) : '--:--';
          })()}
        </div>
      </div>
    </div>
  );
}

