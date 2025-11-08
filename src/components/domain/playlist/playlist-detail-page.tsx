/**
 * 歌单详情页面组件
 * 用于独立页面展示歌单详情
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { memo } from "react";

interface PlaylistDetailPageProps {
  playlist: Playlist;
}

export const PlaylistDetailPage = memo(function PlaylistDetailPage({ playlist: initialPlaylist }: PlaylistDetailPageProps) {
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist>(initialPlaylist);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { user } = useAuth();
  const { isLiked, toggleFavorite } = useFavorites();

  // 权限检查：私有歌单只有创建者可以访问
  const isOwner = user && playlist ? Number(user.id) === Number(playlist.creatorId) : false;
  const canAccess = playlist.isPublic || isOwner;

  // 如果没有访问权限，显示错误页面
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center py-16">
          <Music className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">访问受限</h2>
          <p className="text-slate-600 mb-6">这是一个私有歌单，只有创建者可以访问</p>
          <Button onClick={() => router.back()} variant="outline">
            返回上一页
          </Button>
        </div>
      </div>
    );
  }

  // 使用收藏Hook
  const { isFollowing: isFollowingHook, followPlaylist, loadFollowStatus } = usePlaylistFollow({
    onSuccess: (playlistId, isFollowing) => {
      // 收藏状态更新成功后，更新本地歌单状态
      setPlaylist(prev => ({ ...prev, isFollowing }));
    },
    onError: (playlistId, error) => {
      // 如果API调用失败，回滚收藏人数的乐观更新
      if (playlist) {
        const currentFollowers = playlist._count?.followers || 0;
        const revertFollowers = isFollowing ? currentFollowers + 1 : Math.max(0, currentFollowers - 1);

        setPlaylist(prev => ({
          ...prev,
          _count: {
            ...prev._count,
            followers: revertFollowers
          }
        }));
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

    setPlaylist(prev => ({
      ...prev,
      _count: {
        ...prev._count,
        followers: Math.max(0, newFollowers)
      }
    }));

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

  // 返回按钮处理
  const handleBack = () => {
    router.back();
  };

  // 刷新歌单数据
  const refreshPlaylist = async () => {
    if (!playlist?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getPlaylistById(playlist.id);
      setPlaylist(data);
      // 使用Hook加载收藏状态
      if (data.id) {
        loadFollowStatus([data.id]);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 使用Hook加载收藏状态
    if (playlist.id) {
      loadFollowStatus([playlist.id]);
    }
  }, [playlist.id, loadFollowStatus]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center py-16">
          <Music className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">加载失败</h2>
          <p className="text-slate-600 mb-6">{error.message}</p>
          <Button onClick={refreshPlaylist} variant="outline">
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  const songs: Song[] | undefined = playlist.songs as unknown as Song[] | undefined;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-slate-900">歌单详情</h1>
          </div>
        </div>
      </div>

      {/* 页面内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">

          {/* 顶部信息：增强布局 */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-start gap-8">
              {/* 封面 */}
              <div className="w-48 h-48 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center shadow-lg border border-slate-200 flex-shrink-0">
                {playlist.coverUrl ? (
                  <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
                ) : (
                  <Music className="w-20 h-20 text-slate-400" />
                )}
              </div>

              {/* 信息区域 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-4xl font-bold text-slate-900 mb-3">{playlist.name}</h1>
                    <p className="text-slate-600 mb-4">
                      创建者：{playlist.creator?.username || (playlist as unknown as { creator?: { name?: string } }).creator?.name || "未知"}
                    </p>
                    {playlist.description && (
                      <p className="text-slate-600 mb-6 leading-relaxed">{playlist.description}</p>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-col gap-3">
                    {isOwner && (
                      <Button
                        onClick={() => setIsEditOpen(true)}
                        variant="outline"
                        size="default"
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        编辑歌单
                      </Button>
                    )}
                    {/* 只有不是自己的歌单且用户已登录时才显示收藏按钮 */}
                    {!isOwner && user && (
                      <Button
                        onClick={handleFollow}
                        variant={isFollowing ? "outline" : "default"}
                        className={isFollowing ? "text-slate-600 hover:text-slate-900" : ""}
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
                <div className="flex items-center gap-8 text-sm text-slate-500 mt-6">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    <span className="font-medium">{songs?.length || 0} 首歌曲</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-5 h-5" />
                    <span className="font-medium">{playlist._count?.followers || 0} 人收藏</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>创建于 {new Date(playlist.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 歌曲列表 */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-xl font-semibold text-slate-900">歌曲列表</h2>
            </div>

            {/* 表头 */}
            <div className="px-8 text-slate-600 text-xs font-medium grid grid-cols-[60px_56px_1fr_1fr_100px_140px] gap-4 h-12 items-center border-b border-slate-200 bg-slate-50/50">
              <div className="pl-1">#</div>
              <div className="text-center">封面</div>
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
                    className="grid grid-cols-[60px_56px_1fr_1fr_100px_140px] gap-4 items-center h-16 hover:bg-slate-50 transition-colors group px-8"
                  >
                    {/* 序号 */}
                    <div className="text-slate-400 text-sm tabular-nums font-medium">
                      {String(idx + 1).padStart(2, '0')}
                    </div>

                    {/* 封面 */}
                    <div className="flex items-center justify-center">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-200 flex items-center justify-center border border-slate-100">
                        {s.album?.coverUrl ? (
                          <img
                            src={s.album.coverUrl}
                            alt={s.album?.title ? `${s.album.title} 封面` : `${s.title} 封面`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
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
        </div>
      </div>

      {/* 添加到歌单对话框 */}
      {showAddDialog && selectedSong && (
        <PlaylistSelectDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          song={selectedSong}
        />
      )}

      {isOwner && playlist && (
        <PlaylistEditDialog
          playlist={playlist}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSuccess={(updated) => {
            setPlaylist(prev => ({
              ...prev,
              name: updated.name,
              description: updated.description ?? null,
              coverUrl: updated.coverUrl ?? null,
              isPublic: updated.isPublic,
              tags: updated.tags ?? prev.tags,
              updatedAt: updated.updatedAt ?? prev.updatedAt,
            }));
            setIsEditOpen(false);
            toast.success('歌单信息已更新');
          }}
        />
      )}
    </div>
  );
});