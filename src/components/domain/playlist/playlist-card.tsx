/**
 * 歌单卡片组件
 */

import Image from 'next/image';
import Link from 'next/link';
import { Clock, User, Music, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Playlist } from '@/types/playlist';

interface PlaylistCardProps {
  playlist: Playlist;
  showActions?: boolean;
  onEdit?: (playlistId: number) => void;
  onDelete?: (playlistId: number, playlistName: string) => void;
  isDeleting?: number | null;
  className?: string;
}

export function PlaylistCard({
  playlist,
  showActions = false,
  onEdit,
  onDelete,
  isDeleting = null,
  className = ''
}: PlaylistCardProps) {
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

  const cardContent = (
    <Card
      className={`group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] relative ${className}`}
    >
      {/* 管理按钮 */}
      {showActions && (
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-red-600 focus:text-red-600"
                disabled={isDeleting === playlist.id}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting === playlist.id ? '删除中...' : '删除'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* 封面图 */}
      <div className="relative aspect-square overflow-hidden">
        {playlist.coverUrl ? (
          <Image
            src={playlist.coverUrl}
            alt={playlist.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={(e) => {
              // 如果图片加载失败，隐藏图片显示默认封面
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('bg-gray-200');
                parent.innerHTML = `
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-6xl text-gray-400">🎵</div>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="text-6xl text-gray-400">🎵</div>
          </div>
        )}

        {/* 悬停时的播放按钮 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white/90 rounded-full p-3">
              <Music className="w-6 h-6 text-gray-900" />
            </div>
          </div>
        </div>
      </div>

      {/* 歌单信息 */}
      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
          {playlist.name}
        </h3>

        {playlist.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {playlist.description}
          </p>
        )}

        {/* 元信息 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{playlist.creator.name || playlist.creator.username}</span>
          </div>

          {playlist._count && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Music className="w-3 h-3" />
                <span>{playlist._count.songs}首</span>
              </div>

              {playlist._count.followers > 0 && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{playlist._count.followers}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 创建时间 */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
          <Clock className="w-3 h-3" />
          <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );

  if (showActions) {
    // 在有管理按钮时，不使用 Link 包装，直接使用 onClick 事件
    return (
      <div onClick={() => window.location.href = `/playlists/${playlist.id}`}>
        {cardContent}
      </div>
    );
  }

  // 普通模式，使用 Link 包装
  return (
    <Link href={`/playlists/${playlist.id}`}>
      {cardContent}
    </Link>
  );
}