"use client";

import { useEffect, useState } from "react";
import { getPlaylistById } from "@/services/client/playlist";
import type { Playlist, Song } from "@/types/playlist";
import { Music, ArrowLeft, Heart, Plus, Bookmark, BookmarkCheck, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { usePlaylistFollow } from "@/hooks/use-playlist-follow";
import { useFavorites } from "@/hooks/use-favorites";
import { toast } from "sonner";
import { PlaylistSelectDialog } from "@/components/domain/playlist/playlist-select-dialog";
import { PlaylistEditDialog } from "@/components/domain/playlist/playlist-edit-dialog";

interface PlaylistDetailInlineProps {
  id: number;
  onBack?: () => void;
}

export function PlaylistDetailInline({ id, onBack }: PlaylistDetailInlineProps) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { user } = useAuth();
  const { isLiked, toggleFavorite } = useFavorites();

  // 使用收藏Hook
  const { isFollowing: isFollowingHook, followPlaylist, loadFollowStatus } = usePlaylistFollow({
    onSuccess: (playlistId, isFollowing) => {
      // 收藏状态更新成功后，更新本地歌单状态
      setPlaylist(prev => prev ? { ...prev, isFollowing } : null);
    },
    onError: (playlistId, error) => {
      // 如果API调用失败，回滚收藏人数的乐观更新
      if (playlist) {
        const currentFollowers = playlist._count?.followers || 0;
        const revertFollowers = isFollowing ? currentFollowers + 1 : Math.max(0, currentFollowers - 1);

        setPlaylist(prev => prev ? {
          ...prev,
          _count: {
            ...prev._count,
            followers: revertFollowers
          }
        } : null);
      }
    },
  });

  // 获取当前歌单的收藏状态
  const isFollowing = playlist?.id ? isFollowingHook(playlist.id) : false;

  // 收藏歌单
  const handleFollow = async () => {
    if (!playlist) return;

    // 乐观更新收藏人数
    const currentFollowers = playlist._count?.followers || 0;
    const newFollowers = isFollowing ? currentFollowers - 1 : currentFollowers + 1;

    setPlaylist(prev => prev ? {
      ...prev,
      _count: {
        ...prev._count,
        followers: Math.max(0, newFollowers)
      }
    } : null);

    await followPlaylist(playlist);
  };

  // 添加到歌单
  const handleAddToPlaylist = (song: Song) => {
    if (!user) {
      toast.error('请先登录后再使用此功能');
      return;
    }
    setSelectedSong(song);
    setShowAddDialog(true);
  };

  // 收藏歌曲到"我喜欢的音乐"
  const handleLikeSong = async (song: Song) => {
    if (!user) {
      toast.error('请先登录后再使用此功能');
      return;
    }

    try {
      await toggleFavorite(song);
    } catch (error) {
      // 错误处理已经在 useFavorites Hook 中完成
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getPlaylistById(id);
        if (mounted) {
          setPlaylist(data);
          // 使用Hook加载收藏状态
          if (data.id) {
            loadFollowStatus([data.id]);
          }
        }
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-9 w-24 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-40 bg-slate-200 rounded-lg animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <Music className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">加载失败</h2>
        <p className="text-slate-600 mb-6">{error.message}</p>
        <p className="text-slate-500 text-sm">歌单ID: {id}</p>
      </div>
    );
  }

  if (!playlist) return null;

  const songs: Song[] | undefined = playlist.songs as unknown as Song[] | undefined;

  // 修复类型比较问题
  const isOwner = user && playlist ?
    Number(user.id) === Number(playlist.creatorId) : false;

  return (
    <div className="space-y-6">

      {/* 顶部信息：增强布局 */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-start gap-6">
          {/* 封面 */}
          <div className="w-40 h-40 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center shadow-sm border border-slate-200 flex-shrink-0">
            {playlist.coverUrl ? (
              <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <Music className="w-16 h-16 text-slate-400" />
            )}
          </div>

          {/* 信息区域 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{playlist.name}</h1>
                <p className="text-slate-600 text-sm mb-3">
                  创建者：{playlist.creator?.username || (playlist as unknown as { creator?: { name?: string } }).creator?.name || "未知"}
                </p>
                {playlist.description && (
                  <p className="text-slate-500 text-sm line-clamp-2">{playlist.description}</p>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col gap-2">
                {isOwner && (
                  <Button
                    onClick={() => setIsEditOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="p-2 hover:bg-slate-100 border border-slate-300 rounded-lg"
                    title="编辑歌单"
                  >
                    <Edit className="w-5 h-5 text-slate-600" />
                  </Button>
                )}
                {/* 只有不是自己的歌单且用户已登录时才显示收藏按钮 */}
                {!isOwner && user && (
                  <Button
                    onClick={handleFollow}
                    variant={isFollowing ? "outline" : "default"}
                    size="sm"
                    className={isFollowing ? "text-slate-600 hover:text-slate-900" : ""}
                    title={isFollowing ? "取消收藏此歌单" : "收藏此歌单"}
                  >
                    {isFollowing ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 mr-2" />
                        取消收藏
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 mr-2" />
                        收藏歌单
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* 统计信息 */}
            <div className="flex items-center gap-6 text-sm text-slate-500 mt-4">
              <div className="flex items-center gap-1">
                <Music className="w-4 h-4" />
                <span>{songs?.length || 0} 首歌曲</span>
              </div>
              <div className="flex items-center gap-1">
                <Bookmark className="w-4 h-4" />
                <span>{playlist._count?.followers || 0} 人收藏</span>
              </div>
              <div className="flex items-center gap-1">
                <span>创建于 {new Date(playlist.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 歌曲列表 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">歌曲列表</h2>
        </div>

        {/* 表头 */}
        <div className="px-6 text-slate-600 text-xs font-medium grid grid-cols-[60px_1fr_1fr_100px_140px] gap-4 h-12 items-center border-b border-slate-200 bg-slate-50/50">
          <div className="pl-1">#</div>
          <div>标题</div>
          <div>专辑</div>
          <div>时长</div>
          <div className="text-right pr-1">操作</div>
        </div>

        {/* 歌曲列表 */}
        {songs && songs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {songs.map((s, idx) => (
              <div
                key={s.id}
                className="grid grid-cols-[60px_1fr_1fr_100px_140px] gap-4 items-center h-16 hover:bg-slate-50 transition-colors group px-6"
              >
                {/* 序号 */}
                <div className="text-slate-400 text-sm tabular-nums font-medium">
                  {String(idx + 1).padStart(2, '0')}
                </div>

                {/* 歌曲标题和艺术家 */}
                <div className="min-w-0">
                  <p className="text-slate-900 font-medium truncate mb-0.5 group-hover:text-slate-700 transition-colors">
                    {s.title}
                  </p>
                  <p className="text-slate-500 text-xs truncate">{s.artist?.name}</p>
                </div>

                {/* 专辑 */}
                <div className="text-slate-600 text-sm truncate">
                  {s.album?.title ?? '-'}
                </div>

                {/* 时长 */}
                <div className="text-slate-500 text-sm tabular-nums font-medium">
                  {s.duration ?? '--:--'}
                </div>

                {/* 操作按钮 */}
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleLikeSong(s)}
                      className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                        isLiked(s.id)
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-slate-400 hover:text-red-500'
                      }`}
                      title={isLiked(s.id) ? '取消喜欢' : '添加到喜欢的音乐'}
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked(s.id) ? 'fill-current' : ''}`}
                      />
                    </button>
                    <button
                      onClick={() => handleAddToPlaylist(s)}
                      className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all"
                      title="添加到歌单"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500">
            <Music className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-400">暂无歌曲</p>
          </div>
        )}
      </div>

      {/* 添加到歌单对话框 */}
      {showAddDialog && selectedSong && (
        <PlaylistSelectDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          song={selectedSong}
          onSuccess={() => {
            setShowAddDialog(false);
            setSelectedSong(null);
            toast.success('已添加到歌单');
          }}
        />
      )}

      {isOwner && playlist && (
        <PlaylistEditDialog
          playlist={playlist}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSuccess={(updated) => {
            setPlaylist(prev => {
              if (!prev) {
                return updated;
              }
              return {
                ...prev,
                name: updated.name,
                description: updated.description ?? null,
                coverUrl: updated.coverUrl ?? null,
                isPublic: updated.isPublic,
                tags: updated.tags ?? prev.tags,
                updatedAt: updated.updatedAt ?? prev.updatedAt,
              };
            });
            setIsEditOpen(false);
            toast.success('歌单信息已更新');
          }}
        />
      )}
    </div>
  );
}
