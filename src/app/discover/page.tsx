/**
 * 发现页面 - 展示公开歌单（点击后在本页主内容区展示歌曲列表，不跳转）
 */

"use client";

import { useState, useEffect } from 'react';
import { PlaylistGrid } from '@/components/domain/playlist/playlist-grid';
import { MainLayout } from '@/components/layout/main-layout';
import { getPublicPlaylists } from '@/services/client/playlist';
import { Playlist } from '@/types/playlist';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw } from 'lucide-react';
import { PlaylistDetailInline } from '@/components/domain/playlist/playlist-detail-inline';

export default function DiscoverPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // 详情视图：在本页内渲染，保持与“我创建的歌单”一致的样式
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const pageSize = 12;

  // 加载歌单数据
  const loadPlaylists = async (page: number = 1, search: string = '', append: boolean = false) => {
    try {
      if (!append) {
        setIsLoading(true);
      }
      setError(null);

      const response = await getPublicPlaylists({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
      });

      if (append) {
        setPlaylists((prev) => [...prev, ...response.data]);
      } else {
        setPlaylists(response.data);
      }

      setHasMore(response.pagination.page < response.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载失败'));
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadPlaylists(1, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 搜索处理
  const handleSearch = () => {
    setCurrentPage(1);
    setIsSearching(true);
    loadPlaylists(1, searchQuery);
  };

  // 刷新处理
  const handleRefresh = () => {
    setCurrentPage(1);
    setSearchQuery('');
    loadPlaylists(1, '');
  };

  // 加载更多
  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadPlaylists(nextPage, searchQuery, true);
  };

  // 回车搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 点击卡片：在本页渲染内嵌详情（统一样式）
  const handleSelectPlaylist = (id: number) => {
    setSelectedId(id);
  };

  return (
    <MainLayout>
      {/* 标题与搜索：仅在未选择歌单时显示 */}
      {!selectedId && (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">发现歌单</h1>
            <p className="text-slate-600">探索由其他用户创建的精彩歌单</p>
          </div>

          <div className="mb-8">
            <div className="flex gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="搜索歌单名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </div>
        </>
      )}

      {/* 主内容：在页内展示歌单详情；未选择时显示网格 */}
      {selectedId ? (
        <div className="space-y-4">
          <PlaylistDetailInline id={selectedId} />
        </div>
      ) : (
        <PlaylistGrid
          playlists={playlists}
          isLoading={isLoading && !isSearching}
          error={error}
          className="min-h-[400px]"
          onSelect={handleSelectPlaylist}
        />
      )}

      {/* 加载更多按钮 */}
      {!isLoading && !error && playlists.length > 0 && hasMore && !selectedId && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" onClick={loadMore} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                加载中..
              </>
            ) : (
              '加载更多'
            )}
          </Button>
        </div>
      )}

      {/* 没有更多内容提示 */}
      {!isLoading && !error && playlists.length > 0 && !hasMore && !selectedId && (
        <div className="text-center mt-8 text-slate-500">已经到底啦～</div>
      )}
    </MainLayout>
  );
}

