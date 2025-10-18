/**
 * 个人音乐库页面
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music, ListMusic, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaylistGrid } from '@/components/domain/playlist/playlist-grid';
import { PlaylistGridSkeleton } from '@/components/domain/playlist/playlist-skeleton';
import { PlaylistDialog } from '@/components/domain/playlist/playlist-dialog';
import { MainLayout } from '@/components/layout/main-layout';
import { getMyPlaylists, deletePlaylist } from '@/services/client/playlist';
import { PlaylistQueryParams } from '@/types/playlist';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { Search, Compass } from 'lucide-react';

export default function LibraryPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [playlists, setPlaylists] = useState<any[]>([]);
  const [followedPlaylists, setFollowedPlaylists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('created');

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
    <MainLayout onCreatePlaylist={handleCreateSuccess}>
      {/* 页面标题和统计信息 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">我的音乐库</h1>
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <span>管理你创建和收藏的歌单</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ListMusic className="w-4 h-4 text-indigo-600" />
              <span><span className="font-semibold text-slate-900">{playlists.length}</span> 个创建</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-pink-600" />
              <span><span className="font-semibold text-slate-900">{followedPlaylists.length}</span> 个收藏</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs 切换 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Tabs 导航栏 + 搜索 + 创建按钮（移动端） */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <TabsList className="bg-slate-100 p-1 rounded-lg">
            <TabsTrigger
              value="created"
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-md px-4 py-2"
            >
              <ListMusic className="w-4 h-4 mr-2" />
              我创建的
            </TabsTrigger>
            <TabsTrigger
              value="followed"
              className="data-[state=active]:bg-white data-[state=active]:text-pink-700 data-[state=active]:shadow-sm rounded-md px-4 py-2"
            >
              <Heart className="w-4 h-4 mr-2" />
              我收藏的
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-3 flex-1 sm:flex-initial">
            {/* 搜索框 */}
            <form onSubmit={handleSearch} className="flex-1 sm:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder={activeTab === 'created' ? '搜索创建的...' : '搜索收藏的...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* 移动端创建按钮 */}
            <div className="lg:hidden">
              <PlaylistDialog onCreateSuccess={handleCreateSuccess}>
                <Button>
                  <Music className="w-4 h-4" />
                </Button>
              </PlaylistDialog>
            </div>
          </div>
        </div>

        {/* 我创建的歌单 */}
        <TabsContent value="created" className="mt-6 space-y-6">
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
                  <span className="text-sm text-slate-600">
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
            <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
              <ListMusic className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                {searchQuery ? '没有找到匹配的歌单' : '还没有创建任何歌单'}
              </h2>
              <p className="text-slate-600 mb-6">
                {searchQuery
                  ? '试试其他关键词吧～'
                  : '创建你的第一个歌单，开始整理喜欢的音乐吧～'
                }
              </p>
              {!searchQuery && (
                <PlaylistDialog onCreateSuccess={handleCreateSuccess}>
                  <Button size="lg">
                    <Music className="w-4 h-4 mr-2" />
                    创建第一个歌单
                  </Button>
                </PlaylistDialog>
              )}
            </div>
          )}
        </TabsContent>

        {/* 我收藏的歌单 */}
        <TabsContent value="followed" className="mt-6">
          <div className="text-center py-20 bg-white rounded-lg border border-slate-200">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-100 mb-6">
              <Heart className="w-10 h-10 text-pink-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              收藏功能即将上线
            </h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              我们正在开发歌单收藏功能，敬请期待！<br />
              届时你可以收藏喜欢的公开歌单，方便随时查看。
            </p>
            <Button
              variant="outline"
              onClick={() => router.push('/discover')}
            >
              <Compass className="w-4 h-4 mr-2" />
              去发现广场看看
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}