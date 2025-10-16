/**
 * 歌单详情页头部组件
 */

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, Music, Edit, Trash2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Playlist } from '@/types/playlist';
import { useAuth } from '@/contexts/auth-context';

interface PlaylistHeaderProps {
  playlist: Playlist;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onFollow?: () => void;
  isFollowing?: boolean;
}

export function PlaylistHeader({
  playlist,
  isOwner,
  onEdit,
  onDelete,
  onFollow,
  isFollowing = false
}: PlaylistHeaderProps) {
  const { user } = useAuth();

  // 默认封面
  const defaultCover = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='system-ui' font-size='24' fill='%239ca3af'%3E🎵%3C/text%3E%3C/svg%3E";

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 封面图 */}
          <div className="flex-shrink-0">
            <div className="relative w-64 h-64 md:w-80 md:h-80 shadow-xl rounded-lg overflow-hidden">
              {playlist.coverUrl ? (
                <Image
                  src={playlist.coverUrl}
                  alt={playlist.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="text-8xl text-gray-400">🎵</div>
                </div>
              )}
            </div>
          </div>

          {/* 歌单信息 */}
          <div className="flex-1 min-w-0">
            {/* 歌单名称 */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {playlist.name}
            </h1>

            {/* 描述 */}
            {playlist.description && (
              <p className="text-lg text-gray-600 mb-6 line-clamp-3">
                {playlist.description}
              </p>
            )}

            {/* 创建者信息 */}
            <div className="flex items-center gap-3 mb-6">
              <Link href={`/users/${playlist.creator.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {playlist.creator.avatar ? (
                  <Image
                    src={playlist.creator.avatar}
                    alt={playlist.creator.username}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                <span className="font-medium text-gray-900">
                  {playlist.creator.name || playlist.creator.username}
                </span>
              </Link>
              <span className="text-gray-500">创建</span>
            </div>

            {/* 统计信息 */}
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-8">
              <div className="flex items-center gap-1">
                <Music className="w-4 h-4" />
                <span>{playlist._count?.songs || 0} 首歌曲</span>
              </div>

              {playlist._count && playlist._count.followers > 0 && (
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{playlist._count.followers} 人收藏</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3">
              {isOwner ? (
                <>
                  <Button onClick={onEdit} variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    编辑歌单
                  </Button>
                  <Button onClick={onDelete} variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除歌单
                  </Button>
                </>
              ) : user ? (
                <Button
                  onClick={onFollow}
                  variant={isFollowing ? "outline" : "default"}
                  className={isFollowing ? "text-gray-600" : ""}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFollowing ? "fill-current" : ""}`} />
                  {isFollowing ? "取消收藏" : "收藏歌单"}
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/auth/login">
                    <Heart className="w-4 h-4 mr-2" />
                    收藏歌单
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}