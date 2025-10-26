/**
 * 首页
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music, TrendingUp, Users, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/main-layout';
import { PlaylistGrid } from '@/components/domain/playlist/playlist-grid';
import { PlaylistDetailInline } from '@/components/domain/playlist/playlist-detail-inline';
import { getPublicPlaylists } from '@/services/client/playlist';
import { Playlist } from '@/types/playlist';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 详情视图：在本页内渲染
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 加载推荐歌单
  useEffect(() => {
    const loadFeaturedPlaylists = async () => {
      try {
        setIsLoading(true);
        const response = await getPublicPlaylists({ page: 1, limit: 6 });
        setFeaturedPlaylists(response.data || []);
      } catch (error) {
        console.error('Failed to load featured playlists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedPlaylists();
  }, []);

  // 点击歌单：在本页渲染内嵌详情
  const handleSelectPlaylist = (id: number) => {
    setSelectedId(id);
  };

  return (
    <MainLayout>
      {!selectedId && (
        <>
          {/* Hero 区域 */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-indigo-600 to-pink-600 rounded-2xl p-8 md:p-12 text-white shadow-xl">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  欢迎来到歌单管理系统
                </h1>
                <p className="text-lg md:text-xl text-indigo-100 mb-8">
                  创建、管理和分享你的音乐歌单，探索其他用户的精彩收藏
                </p>
                <div className="flex flex-wrap gap-4">
                  {user ? (
                    <>
                      <Link href="/library">
                        <Button size="lg" variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50">
                          <Music className="w-5 h-5 mr-2" />
                          我的音乐库
                        </Button>
                      </Link>
                      <Link href="/discover">
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                          发现更多
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login">
                        <Button size="lg" variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50">
                          立即登录
                        </Button>
                      </Link>
                      <Link href="/auth/register">
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                          注册账号
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 功能特性 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">核心功能</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Music className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">创建歌单</h3>
                <p className="text-slate-600">
                  轻松创建和管理你的歌单，整理喜欢的音乐，随时随地访问
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">分享发现</h3>
                <p className="text-slate-600">
                  与其他用户分享你的歌单，发现更多精彩的音乐收藏
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">热门推荐</h3>
                <p className="text-slate-600">
                  浏览热门歌单和推荐内容，发现你可能喜欢的音乐
                </p>
              </Card>
            </div>
          </div>

          {/* 推荐歌单 */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">推荐歌单</h2>
                <p className="text-slate-600">发现社区中的精彩歌单</p>
              </div>
              <Link href="/discover">
                <Button variant="outline">
                  查看全部
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <div className="aspect-square bg-slate-200 rounded-lg animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : featuredPlaylists.length > 0 ? (
              <PlaylistGrid playlists={featuredPlaylists} onSelect={handleSelectPlaylist} />
            ) : (
              <Card className="p-12 text-center">
                <Music className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  暂无推荐歌单
                </h3>
                <p className="text-slate-600 mb-6">
                  目前还没有公开的歌单，快来创建第一个吧！
                </p>
                {user && (
                  <Link href="/library">
                    <Button>
                      <Music className="w-4 h-4 mr-2" />
                      创建歌单
                    </Button>
                  </Link>
                )}
              </Card>
            )}
          </div>

          {/* 底部 CTA */}
          {!user && (
            <div className="bg-slate-100 rounded-xl p-8 text-center">
              <Music className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                开始你的音乐之旅
              </h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                注册账号，立即开始创建和管理你的歌单
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                    免费注册
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline">
                    已有账号？登录
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {/* 主内容：在页内展示歌单详情；未选择时显示首页内容 */}
      {selectedId ? (
        <div className="space-y-4">
          <PlaylistDetailInline
            id={selectedId}
            onBack={() => setSelectedId(null)}
          />
        </div>
      ) : null}
    </MainLayout>
  );
}
