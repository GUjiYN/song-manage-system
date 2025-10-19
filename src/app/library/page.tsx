
/**
 * 个人音乐库页
 */

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Music, ListMusic, Heart, Search, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaylistGrid } from '@/components/domain/playlist/playlist-grid';
import { PlaylistGridSkeleton } from '@/components/domain/playlist/playlist-skeleton';
import { PlaylistDialog } from '@/components/domain/playlist/playlist-dialog';
import { MainLayout } from '@/components/layout/main-layout';
import { getMyPlaylists, getFollowedPlaylists, deletePlaylist } from '@/services/client/playlist';
import type { PlaylistQueryParams, PlaylistsResponse, Playlist } from '@/types/playlist';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function LibraryPage() {
  const router = useRouter();
  const { user } = useAuth();

  // 我创建的
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // 我收藏的
  const [followedPlaylists, setFollowedPlaylists] = useState<Playlist[]>([]);
  const [followedPage, setFollowedPage] = useState(1);
  const [followedTotalPages, setFollowedTotalPages] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'created' | 'followed'>('created');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const limit = 12; // 每页显示12个歌单

  // 拉取“我创建的”
  const loadCreated = async (page: number = 1, search: string = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const params: PlaylistQueryParams = { page, limit, search: search || undefined };
      const res: PlaylistsResponse = await getMyPlaylists(params);
      setPlaylists(res.data || []);
      setCurrentPage(res.pagination.page || 1);
      setTotalPages(res.pagination.totalPages || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载失败'));
      setPlaylists([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 拉取“我收藏的”
  const loadFollowed = async (page: number = 1, search: string = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const params: PlaylistQueryParams = { page, limit, search: search || undefined };
      const res: PlaylistsResponse = await getFollowedPlaylists(params);
      setFollowedPlaylists(res.data || []);
      setFollowedPage(res.pagination.page || 1);
      setFollowedTotalPages(res.pagination.totalPages || 0);
    } catch {
      // 后端可能暂未实现收藏接口，做容错
      setFollowedPlaylists([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadCreated(1, '');
      loadFollowed(1, '');
    }
  }, [user?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'created') {
      setCurrentPage(1);
      loadCreated(1, searchQuery);
    } else {
      setFollowedPage(1);
      loadFollowed(1, searchQuery);
    }
  };

  const handleDeletePlaylist = async (playlistId: number, playlistName: string) => {
    if (!window.confirm(`确定要删除歌单“${playlistName}”吗？此操作不可恢复。`)) return;
    setIsDeleting(playlistId);
    try {
      await deletePlaylist(playlistId);
      toast.success(`歌单“${playlistName}”已删除`);
      await loadCreated(currentPage, searchQuery);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCreateSuccess = async () => {
    await loadCreated(currentPage, searchQuery);
  };

  // 未登录
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h1>
          <p className="text-gray-600 mb-6">登录后才能查看你的音乐库</p>
          <button onClick={() => router.push('/auth/login')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">去登录</button>
        </div>
      </div>
    );
  }

  // 加载骨架
  if (isLoading && playlists.length === 0 && followedPlaylists.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <PlaylistGridSkeleton count={12} />
        </div>
      </div>
    );
  }

  // 错误态
  if (error && playlists.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">出错了</h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => loadCreated(currentPage, searchQuery)} variant="outline">重试</Button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout onCreatePlaylist={handleCreateSuccess}>
      {/* 用户信息与统计（桌面端） */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-28 h-28 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-semibold">
            {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-slate-600">{user?.name || user?.username}</p>
          </div>
        </div>
        <div>
          <PlaylistDialog onCreateSuccess={handleCreateSuccess}>
            <Button>
              <Music className="w-4 h-4 mr-2" />
              新建歌单
            </Button>
          </PlaylistDialog>
        </div>
      </div>

      {/* Tabs + 搜索 */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'created' | 'followed')} className="space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <TabsList className="bg-slate-100 p-1 rounded-lg">
            <TabsTrigger value="created" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-md px-4 py-2">
              <ListMusic className="w-4 h-4 mr-2" /> 我创建的
            </TabsTrigger>
            <TabsTrigger value="followed" className="data-[state=active]:bg-white data-[state=active]:text-pink-700 data-[state=active]:shadow-sm rounded-md px-4 py-2">
              <Heart className="w-4 h-4 mr-2" /> 我收藏的
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 我创建的歌单 */}
        <TabsContent value="created" className="mt-6 space-y-6">
          {playlists.length > 0 ? (
            <>
              <PlaylistGrid
                playlists={playlists}
                showActions={true}
                onEdit={(id) => router.push(`/playlists/edit/${id}`)}
                onDelete={handleDeletePlaylist}
                isDeleting={isDeleting}
                onSelect={(id) => window.dispatchEvent(new CustomEvent('open-playlist-inline', { detail: id }))}
              />

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button variant="outline" size="sm" onClick={() => loadCreated(currentPage - 1, searchQuery)} disabled={currentPage <= 1 || isLoading}>
                    上一页
                  </Button>
                  <span className="text-sm text-slate-600">第 {currentPage} 页，共 {totalPages} 页</span>
                  <Button variant="outline" size="sm" onClick={() => loadCreated(currentPage + 1, searchQuery)} disabled={currentPage >= totalPages || isLoading}>
                    下一页
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
              <ListMusic className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">{searchQuery ? '没有找到匹配的歌单' : '还没有创建任何歌单'}</h2>
              <p className="text-slate-600 mb-6">{searchQuery ? '试试其他关键词吧~' : '创建你的第一个歌单，开始整理喜欢的音乐吧～'}</p>
              {!searchQuery && (
                <PlaylistDialog onCreateSuccess={handleCreateSuccess}>
                  <Button size="lg">
                    <Music className="w-4 h-4 mr-2" /> 创建第一个歌单
                  </Button>
                </PlaylistDialog>
              )}
            </div>
          )}
        </TabsContent>

        {/* 我收藏的歌单 */}
        <TabsContent value="followed" className="mt-6 space-y-6">
          {followedPlaylists.length > 0 ? (
            <>
              <PlaylistGrid
                playlists={followedPlaylists}
                onSelect={(id) => window.dispatchEvent(new CustomEvent('open-playlist-inline', { detail: id }))}
              />

              {followedTotalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button variant="outline" size="sm" onClick={() => loadFollowed(followedPage - 1, searchQuery)} disabled={followedPage <= 1 || isLoading}>
                    上一页
                  </Button>
                  <span className="text-sm text-slate-600">第 {followedPage} 页，共 {followedTotalPages} 页</span>
                  <Button variant="outline" size="sm" onClick={() => loadFollowed(followedPage + 1, searchQuery)} disabled={followedPage >= followedTotalPages || isLoading}>
                    下一页
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
              <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">暂无收藏的歌单</h2>
              <p className="text-slate-600 mb-6">去发现广场逛逛，收藏喜欢的歌单吧～</p>
              <Button variant="outline" onClick={() => router.push('/discover')}>
                <Compass className="w-4 h-4 mr-2" /> 前往发现广场
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
