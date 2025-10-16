/**
 * 歌单详情页面
 */

"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlaylistHeader } from '@/components/domain/playlist/playlist-header';
import { SongList } from '@/components/domain/playlist/song-list';
import { getPlaylistById } from '@/services/client/playlist';
import { deletePlaylist } from '@/services/client/playlist';
import { Playlist, Song } from '@/types/playlist';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const playlistId = Number(params.id);

  // 加载歌单详情
  const loadPlaylist = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getPlaylistById(playlistId);
      setPlaylist(data);
      setIsFollowing(data.isFollowing || false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载失败'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (playlistId && !isNaN(playlistId)) {
      loadPlaylist();
    } else {
      setError(new Error('无效的歌单ID'));
    }
  }, [playlistId]);

  // 播放歌曲（暂时只显示提示）
  const handlePlaySong = (song: Song) => {
    toast.info(`播放功能即将推出！现在播放：${song.title}`);
  };

  // 编辑歌单
  const handleEdit = () => {
    router.push(`/playlists/${playlistId}/edit`);
  };

  // 删除歌单
  const handleDelete = async () => {
    if (!playlist) return;

    const confirmed = window.confirm(`确定要删除歌单"${playlist.name}"吗？此操作不可恢复。`);
    if (!confirmed) return;

    try {
      await deletePlaylist(playlistId);
      toast.success('歌单删除成功');
      router.push('/discover');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  // 收藏/取消收藏
  const handleFollow = async () => {
    // TODO: 实现收藏功能
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? '已取消收藏' : '收藏成功');
  };

  // 移除歌曲
  const handleRemoveSong = async (songId: number) => {
    if (!playlist) return;

    const song = playlist.songs?.find(s => s.id === songId);
    if (!song) return;

    const confirmed = window.confirm(`确定要从歌单中移除"${song.title}"吗？`);
    if (!confirmed) return;

    // TODO: 实现移除歌曲功能
    toast.success('歌曲移除成功');
    loadPlaylist(); // 重新加载歌单
  };

  // 返回上一页
  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* 加载头部 */}
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 加载歌曲列表 */}
        <div className="container mx-auto px-4 py-8">
          <SongList isLoading={true} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">出错了</h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上一页
          </Button>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">歌单不存在</h1>
          <p className="text-gray-600 mb-4">找不到您要查看的歌单</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上一页
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user ? user.id === playlist.creatorId : false;

  return (
    <div className="min-h-screen bg-white">
      {/* 返回按钮 */}
      <div className="container mx-auto px-4 pt-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
      </div>

      {/* 歌单头部 */}
      <PlaylistHeader
        playlist={playlist}
        isOwner={isOwner}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFollow={handleFollow}
        isFollowing={isFollowing}
      />

      {/* 歌曲列表 */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">歌曲列表</h2>
          {isOwner && (
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              添加歌曲
            </Button>
          )}
        </div>

        <SongList
          songs={playlist.songs || []}
          isLoading={false}
          isOwner={isOwner}
          onPlaySong={handlePlaySong}
          onRemoveSong={handleRemoveSong}
        />
      </div>
    </div>
  );
}