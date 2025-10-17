/**
 * 个人音乐库页面
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaylistGrid } from '@/components/domain/playlist/playlist-grid';
import { PlaylistGridSkeleton } from '@/components/domain/playlist/playlist-skeleton';
import { PlaylistDialog } from '@/components/domain/playlist/playlist-dialog';
import { getMyPlaylists, deletePlaylist } from '@/services/client/playlist';
import { PlaylistQueryParams } from '@/types/playlist';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function LibraryPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const limit = 12; // 每页显示12个歌单

  // 加载用户歌单
  const loadPlaylists = async (page: number = 1, search: string = '') => {
    try {
      setIsLoading(true);
      setError(null);

      const params: PlaylistQueryParams = {
        page,
        limit,
        search: search || undefined
      };

      const response = await getMyPlaylists(params);
      setPlaylists(response.playlists || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.page || 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载失败'));
      setPlaylists([]); // 出错时清空歌单列表
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPlaylists(currentPage, searchQuery);
    }
  }, [user]);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPlaylists(1, searchQuery);
  };

  // 处理删除歌单
  const handleDeletePlaylist = async (playlistId: number, playlistName: string) => {
    if (!window.confirm(`确定要删除歌单"${playlistName}"吗？此操作不可恢复。`)) {
      return;
    }

    setIsDeleting(playlistId);
    try {
      await deletePlaylist(playlistId);
      toast.success(`歌单"${playlistName}"已删除`);

      // 重新加载歌单列表
      await loadPlaylists(currentPage, searchQuery);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除失败';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  // 处理创建歌单成功
  const handleCreateSuccess = async (newPlaylist: any) => {
    // 重新加载歌单列表
    await loadPlaylists(currentPage, searchQuery);
  };

  // 处理编辑歌单
  const handleEditPlaylist = (playlistId: number) => {
    router.push(`/playlists/edit/${playlistId}`);
  };

  // 检查用户是否已登录
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h1>
          <p className="text-gray-600 mb-6">登录后才能查看你的音乐库</p>
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

  // 加载状态
  if (isLoading && playlists.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          {/* 页面头部骨架 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>

          {/* 搜索栏骨架 */}
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* 歌单网格骨架 */}
          <PlaylistGridSkeleton count={12} />
        </div>
      </div>
    );
  }

  // 错误状态
  if (error && playlists.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">出错了</h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button
            onClick={() => loadPlaylists(currentPage, searchQuery)}
            variant="outline"
          >
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">我的音乐库</h1>
            <p className="text-gray-600">管理你创建的歌单</p>
          </div>
          <PlaylistDialog onCreateSuccess={handleCreateSuccess} />
        </div>

        {/* 搜索栏 */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="搜索我的歌单..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* 歌单列表 */}
        {playlists.length > 0 ? (
          <>
            <PlaylistGrid
              playlists={playlists}
              showActions={true}
              onEdit={handleEditPlaylist}
              onDelete={handleDeletePlaylist}
              isDeleting={isDeleting}
            />

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadPlaylists(currentPage - 1, searchQuery)}
                  disabled={currentPage <= 1 || isLoading}
                >
                  上一页
                </Button>

                <span className="text-sm text-gray-600">
                  第 {currentPage} 页，共 {totalPages} 页
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadPlaylists(currentPage + 1, searchQuery)}
                  disabled={currentPage >= totalPages || isLoading}
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? '没有找到匹配的歌单' : '还没有创建任何歌单'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? '试试其他关键词吧～'
                : '创建你的第一个歌单，开始整理喜欢的音乐吧～'
              }
            </p>
            {!searchQuery && (
              <PlaylistDialog
                onCreateSuccess={handleCreateSuccess}
              >
                <Button size="lg">
                  创建第一个歌单
                </Button>
              </PlaylistDialog>
            )}
          </div>
        )}

        {/* 错误提示（在有数据时） */}
        {error && playlists.length > 0 && (
          <div className="text-center py-4">
            <p className="text-red-600 text-sm">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}