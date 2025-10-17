/**
 * 创建歌单页面
 */

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlaylistForm } from '@/components/domain/playlist/playlist-form';
import { createPlaylist } from '@/services/client/playlist';
import { PlaylistFormData } from '@/types/playlist';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function CreatePlaylistPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 检查用户是否已登录
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h1>
          <p className="text-gray-600 mb-6">登录后才能创建歌单</p>
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
    setIsLoading(true);
    try {
      const newPlaylist = await createPlaylist(data);
      toast.success(`歌单"${newPlaylist.name}"创建成功！`);

      // 跳转到新创建的歌单详情页
      router.push(`/playlists/${newPlaylist.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建失败';
      toast.error(errorMessage);
      throw error; // 让表单组件显示错误状态
    } finally {
      setIsLoading(false);
    }
  };

  // 取消操作
  const handleCancel = () => {
    router.back();
  };

  return (
    <PlaylistForm
      title="创建新歌单"
      submitText="创建歌单"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      onCancel={handleCancel}
      showCancel={true}
    />
  );
}