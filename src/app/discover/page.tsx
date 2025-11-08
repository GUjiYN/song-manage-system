/**
 * 发现页面 - 展示公开歌单和最新音乐
 */

"use client";

import { useState, useEffect } from 'react';
import { PlaylistGrid } from '@/components/domain/playlist/playlist-grid';
import { MainLayout } from '@/components/layout/main-layout';
import { getDiscoverData, type DiscoverData, type DiscoverCategory } from '@/services/client/discover';
import { Playlist } from '@/types/playlist';
import { LatestSongsList } from '@/components/domain/discover/latest-songs-list';

export default function DiscoverPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [discover, setDiscover] = useState<DiscoverData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DiscoverCategory | null>(null);

  // 加载发现页数据
  const loadDiscover = async (categoryId?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDiscoverData({ categoryId, limitSongs: 10, limitPlaylists: 12 });
      setDiscover(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载失败'));
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadDiscover();
  }, []);

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">发现</h1>
        <p className="text-slate-600">探索精选的歌曲和歌单</p>
      </div>

      <div className="space-y-10">
        {/* 分类筛选 */}
        <div>
          {error ? (
            <p className="text-slate-600">{error.message}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  loadDiscover(undefined);
                }}
                className={`px-3 py-1.5 rounded-full text-sm border ${!selectedCategory ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                全部
              </button>
              {discover?.categories?.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c);
                    loadDiscover(c.id);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm border ${selectedCategory?.id === c.id ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  title={`共 ${c.songCount} 首`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 最新音乐 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-slate-900">最新音乐</h2>
          </div>
          {isLoading ? (
            <LatestSongsList songs={[]} isLoading={true} />
          ) : discover && discover.featuredSongs.length > 0 ? (
            <LatestSongsList songs={discover.featuredSongs} />
          ) : (
            <div className="text-center text-slate-500 py-10">暂无推荐歌曲</div>
          )}
        </div>

        {/* 热门歌单 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-slate-900">热门歌单</h2>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : discover && discover.featuredPlaylists.length > 0 ? (
            <PlaylistGrid playlists={discover.featuredPlaylists as unknown as Playlist[]} />
          ) : (
            <div className="text-center text-slate-500 py-10">暂无推荐歌单</div>
          )}
        </div>
      </div>

      {/* 发现页不做分页，"更多"留待专页 */}
    </MainLayout>
  );
}