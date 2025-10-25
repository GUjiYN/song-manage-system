import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { Song } from '@/types/playlist';

interface UseFavoritesOptions {
  onSuccess?: (songId: number, isLiked: boolean) => void;
  onError?: (songId: number, error: Error) => void;
}

export function useFavorites(options: UseFavoritesOptions = {}) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Set<number>>(new Set());
  const [favoritesPlaylist, setFavoritesPlaylist] = useState<any>(null);

  // 加载用户的喜欢歌曲列表
  const loadFavorites = async () => {
    if (!user?.id) {
      console.log('未登录，跳过加载喜欢列表');
      return;
    }

    try {
      setIsLoading(true);
      console.log('开始加载喜欢列表，用户ID:', user.id);
      const response = await fetch('/api/playlists/favorites');
      console.log('喜欢列表API响应状态:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('喜欢列表数据:', data);
        setFavoritesPlaylist(data.data);

        // 构建喜欢歌曲ID集合
        const likedIds = new Set(data.data.songs?.map((song: any) => song.id) || []);
        console.log('构建的喜欢歌曲ID集合:', Array.from(likedIds));
        setLikedSongs(likedIds);
      } else {
        const errorData = await response.text();
        console.error('喜欢列表API错误:', response.status, errorData);
      }
    } catch (error) {
      console.error('加载喜欢列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 切换歌曲的喜欢状态
  const toggleFavorite = async (song: Song) => {
    if (!user?.id) {
      toast.error('请先登录后再使用喜欢功能');
      return false;
    }

    const songId = song.id;
    const isCurrentlyLiked = likedSongs.has(songId);

    try {
      setIsLoading(true);

      // 乐观更新UI
      setLikedSongs(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(songId);
        } else {
          newSet.add(songId);
        }
        return newSet;
      });

      const response = await fetch('/api/playlists/favorites/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId }),
      });

      if (!response.ok) {
        // 回滚乐观更新
        setLikedSongs(prev => {
          const newSet = new Set(prev);
          if (isCurrentlyLiked) {
            newSet.add(songId);
          } else {
            newSet.delete(songId);
          }
          return newSet;
        });
        throw new Error('操作失败');
      }

      const result = await response.json();
      const isLiked = result.data.isAdded;

      // 显示成功提示
      toast.success(result.data.message);

      // 更新喜欢歌曲列表
      if (favoritesPlaylist && favoritesPlaylist.songs) {
        setFavoritesPlaylist(prev => ({
          ...prev,
          songs: isLiked
            ? [...prev.songs, song]
            : prev.songs.filter((s: any) => s.id !== songId),
          _count: {
            ...prev._count,
            songs: isLiked ? prev._count.songs + 1 : prev._count.songs - 1
          }
        }));
      }

      // 调用成功回调
      options.onSuccess?.(songId, isLiked);

      return isLiked;
    } catch (error) {
      // 回滚乐观更新
      setLikedSongs(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.add(songId);
        } else {
          newSet.delete(songId);
        }
        return newSet;
      });

      toast.error('操作失败，请重试');
      options.onError?.(songId, error as Error);
      return isCurrentlyLiked; // 返回原始状态
    } finally {
      setIsLoading(false);
    }
  };

  // 检查歌曲是否被喜欢
  const isLiked = (songId: number) => {
    return likedSongs.has(songId);
  };

  // 获取喜欢歌曲数量
  const getLikedCount = () => {
    return likedSongs.size;
  };

  useEffect(() => {
    if (user?.id) {
      loadFavorites();
    } else {
      // 清空状态
      setLikedSongs(new Set());
      setFavoritesPlaylist(null);
    }
  }, [user?.id]);

  return {
    likedSongs,
    favoritesPlaylist,
    isLoading,
    toggleFavorite,
    isLiked,
    getLikedCount,
    loadFavorites,
  };
}