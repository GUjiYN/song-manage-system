/**
 * 歌单卡片组件
 */

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Music, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Playlist } from '@/types/playlist';
import { memo } from 'react';

interface PlaylistCardProps {
  playlist: Playlist;
  showActions?: boolean;
  onEdit?: (playlistId: number) => void;
  onDelete?: (playlistId: number, playlistName: string) => void;
  isDeleting?: number | null;
  className?: string;
}

export const PlaylistCard = memo(function PlaylistCard({
  playlist,
  showActions = false,
  onEdit,
  onDelete,
  isDeleting = null,
  className = '',
}: PlaylistCardProps) {
  const router = useRouter();

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(playlist.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(playlist.id, playlist.name);
  };

  const handleCardClick = () => {
    router.push(`/playlists/${playlist.id}`);
  };

  const cardContent = (
    <div
      className={`group cursor-pointer transition-all duration-200 ${className}`}
      onClick={handleCardClick}
    >
      {/* 封面容器 - 正方形 */}
      <div className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200">

        {/* 封面图 */}
        {playlist.coverUrl ? (
          <Image
            src={playlist.coverUrl}
            alt={playlist.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={(e) => {
              // 如果图片加载失败，隐藏图片显示默认封面
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('bg-gradient-to-br', 'from-slate-100', 'to-slate-200');
                parent.innerHTML = `
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-6xl text-slate-400">🎵</div>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <div className="text-6xl text-slate-400">🎵</div>
          </div>
        )}

        {/* 悬停时的播放按钮 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform scale-90 group-hover:scale-100">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <Music className="w-7 h-7 text-slate-800" />
            </div>
          </div>
        </div>
      </div>

      {/* 歌单信息 - 显示在封面下方 */}
      <div className="mt-3 space-y-1">
        {/* 歌单名称 */}
        <h3 className="font-semibold text-base line-clamp-2 text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
          {playlist.name}
        </h3>

        {/* 歌曲数量和创建者 */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {playlist._count && (
            <div className="flex items-center gap-1">
              <Music className="w-3.5 h-3.5" />
              <span>{playlist._count.songs}</span>
            </div>
          )}
          <span className="text-slate-300">&middot;</span>
          <div className="flex items-center gap-1 line-clamp-1">
            <User className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{playlist.creator?.username || '未知'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 所有情况都使用简单的div包装，点击时通过路由跳转
  return (
    <div>
      {cardContent}
      {/* 操作按钮 */}
      {showActions && (
        <div className="mt-2 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit className="w-4 h-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-red-600 focus:text-red-600"
                disabled={isDeleting === playlist.id}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting === playlist.id ? '删除中...' : '删除'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
});
