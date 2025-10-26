import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { Playlist } from '@/types/playlist';

interface UsePlaylistFollowOptions {
  onSuccess?: (playlistId: number, isFollowing: boolean) => void;
  onError?: (playlistId: number, error: Error) => void;
}

export function usePlaylistFollow(options: UsePlaylistFollowOptions = {}) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [followedPlaylists, setFollowedPlaylists] = useState<Set<number>>(new Set());

  // 检查歌单是否被收藏
  const isFollowing = (playlistId: number) => {
    return followedPlaylists.has(playlistId);
  };

  // 切换收藏状态
  const toggleFollow = async (playlist: Playlist) => {
    if (!user?.id) {
      toast.error('请先登录后再使用收藏功能');
      return false;
    }

    const playlistId = playlist.id;
    const isCurrentlyFollowing = followedPlaylists.has(playlistId);

    // 不能收藏自己的歌单
    if (playlist.creatorId === user.id) {
      toast.error('不能收藏自己的歌单');
      return false;
    }

    try {
      setIsLoading(true);

      // 乐观更新UI
      setFollowedPlaylists(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyFollowing) {
          newSet.delete(playlistId);
        } else {
          newSet.add(playlistId);
        }
        return newSet;
      });

      const response = await fetch(`/api/playlists/${playlistId}/follow`, {
        method: isCurrentlyFollowing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // 回滚乐观更新
        setFollowedPlaylists(prev => {
          const newSet = new Set(prev);
          if (isCurrentlyFollowing) {
            newSet.add(playlistId);
          } else {
            newSet.delete(playlistId);
          }
          return newSet;
        });

        // 处理特殊情况：如果响应返回已收藏状态，保持乐观更新的结果
        const result = await response.json();
        if (result.data?.isFollowing && !isCurrentlyFollowing) {
          // 乐观更新是正确的，无需回滚
          toast.success(result.data.message || '收藏成功');
          options.onSuccess?.(playlistId, true);
          return true;
        }

        throw new Error('操作失败');
      }

      const result = await response.json();
      const isFollowing = result.data?.isFollowing ?? !isCurrentlyFollowing;

      // 显示成功提示
      toast.success(result.data.message || (isFollowing ? '收藏成功' : '取消收藏成功'));

      // 调用成功回调
      options.onSuccess?.(playlistId, isFollowing);

      return isFollowing;
    } catch (error) {
      // 回滚乐观更新
      setFollowedPlaylists(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyFollowing) {
          newSet.add(playlistId);
        } else {
          newSet.delete(playlistId);
        }
        return newSet;
      });

      toast.error('操作失败，请重试');
      options.onError?.(playlistId, error as Error);
      return isCurrentlyFollowing; // 返回原始状态
    } finally {
      setIsLoading(false);
    }
  };

  // 收藏歌单
  const followPlaylist = async (playlist: Playlist) => {
    return toggleFollow(playlist);
  };

  // 取消收藏歌单
  const unfollowPlaylist = async (playlistId: number) => {
    const playlist = { id: playlistId, creatorId: 0 } as Playlist; // 简化处理
    return toggleFollow(playlist);
  };

  // 加载收藏状态（通过外部调用）
  const loadFollowStatus = async (playlistIds: number[]) => {
    if (!user?.id) return;

    try {
      const promises = playlistIds.map(id =>
        fetch(`/api/playlists/${id}/follow`)
          .then(res => res.ok ? res.json() : Promise.resolve(null))
          .then(data => data?.data?.isFollowing ?? false)
      );

      const results = await Promise.all(promises);
      const followedIds = new Set<number>();

      results.forEach((isFollowing, index) => {
        if (isFollowing) {
          followedIds.add(playlistIds[index]);
        }
      });

      setFollowedPlaylists(followedIds);
    } catch (error) {
      console.error('加载收藏状态失败:', error);
    }
  };

  return {
    isFollowing,
    followedPlaylists,
    isLoading,
    followPlaylist,
    unfollowPlaylist,
    toggleFollow,
    loadFollowStatus,
  };
}