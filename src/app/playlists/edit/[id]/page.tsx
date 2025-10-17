/**
 * 编辑歌单页面
 */

"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlaylistForm } from '@/components/domain/playlist/playlist-form';
import { getPlaylistById, updatePlaylist } from '@/services/client/playlist';
import { PlaylistFormData } from '@/types/playlist';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function EditPlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const playlistId = Number(params.id);

  // 加载歌单详情
  const loadPlaylist = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getPlaylistById(playlistId);

      // 检查权限：只有创建者可以编辑
      if (user && data.creatorId !== user.id) {
        throw new Error('只有歌单创建者可以编辑此歌单');
      }

      setPlaylist(data);
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

  // 检查用户是否已登录
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h1>
          <p className="text-gray-600 mb-6">登录后才能编辑歌单</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  // 处理表单提交
  const handleSubmit = async (data: PlaylistFormData) => {
    setIsSubmitting(true);
    try {
      await updatePlaylist(playlistId, data);
      toast.success('歌单更新成功！');

      // 重新加载歌单数据
      await loadPlaylist();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新失败';
      toast.error(errorMessage);
      throw error; // 让表单组件显示错误状态
    } finally {
      setIsSubmitting(false);
    }
  };

  // 取消操作
  const handleCancel = () => {
    router.back();
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-24 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">出错了</h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  // 没有找到歌单
  if (!playlist) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">歌单不存在</h1>
          <p className="text-gray-600 mb-4">找不到要编辑的歌单</p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <PlaylistForm
      initialData={{
        name: playlist.name,
        description: playlist.description || '',
        coverUrl: playlist.coverUrl || '',
        isPublic: playlist.isPublic,
      }}
      title="编辑歌单"
      submitText="保存修改"
      onSubmit={handleSubmit}
      isLoading={isLoading || isSubmitting}
      onCancel={handleCancel}
      showCancel={true}
    />
  );
}