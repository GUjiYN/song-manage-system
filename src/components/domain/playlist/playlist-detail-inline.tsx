"use client";

import { useEffect, useState } from "react";
import { getPlaylistById } from "@/services/client/playlist";
import type { Playlist, Song } from "@/types/playlist";
import { Music, ArrowLeft, Heart, Plus, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { usePlaylistFollow } from "@/hooks/use-playlist-follow";
import { toast } from "sonner";
import { PlaylistSelectDialog } from "@/components/domain/playlist/playlist-select-dialog";

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

  const { user } = useAuth();

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

  // 播放歌曲
  const handlePlaySong = (song: Song) => {
    toast.info(`播放功能即将推出！现在播放：${song.title}`);
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
  const isOwner = user ? user.id === playlist.creatorId : false;

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
                {!isOwner && !user && (
                  <Button variant="outline" size="sm" disabled>
                    <Bookmark className="w-4 h-4 mr-2" />
                    收藏歌单
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
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">歌曲列表</h2>
        </div>

        <div className="px-4 text-slate-500 text-xs font-medium grid grid-cols-[48px_1fr_1fr_80px_120px] gap-2 h-10 items-center border-b border-slate-100">
          <div className="pl-2">#</div>
          <div>标题</div>
          <div>专辑</div>
          <div>时长</div>
          <div className="text-right pr-2">操作</div>
        </div>

        {songs && songs.length > 0 ? (
          <ul>
            {songs.map((s, idx) => (
              <li
                key={s.id}
                className="grid grid-cols-[48px_1fr_1fr_80px_120px] gap-2 items-center h-14 hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <div className="pl-2 text-slate-400 text-sm tabular-nums">{String(idx + 1).padStart(2, '0')}</div>
                <div className="min-w-0 flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-900 truncate">{s.title}</p>
                    <p className="text-slate-500 text-xs truncate">{s.artist?.name}</p>
                  </div>
                </div>
                <div className="text-slate-600 truncate">{s.album?.title ?? '-'}</div>
                <div className="text-slate-500 text-sm tabular-nums">{s.duration ?? '--:--'}</div>
                <div className="text-right pr-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handlePlaySong(s)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                      title="播放"
                    >
                      <Music className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAddToPlaylist(s)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                      title="添加到歌单"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-14 text-center text-slate-500">
            <Music className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p>暂无歌曲</p>
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
    </div>
  );
}
