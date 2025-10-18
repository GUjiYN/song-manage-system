/**
 * 主布局组件 - 包含侧边栏和顶部导航栏
 * 用于所有用户页面（首页、发现广场、搜索、我的音乐库等）
 */

"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Music, ListMusic, Heart, Compass, Library, Home, Menu, X, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaylistDialog } from '@/components/domain/playlist/playlist-dialog';
import { useAuth } from '@/contexts/auth-context';
import { getMyPlaylists, getFollowedPlaylists } from '@/services/client/playlist';
import type { Playlist } from '@/types/playlist';

interface MainLayoutProps {
  children: ReactNode;
  onCreatePlaylist?: (playlist: any) => void;
}

export function MainLayout({ children, onCreatePlaylist }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [followedPlaylists, setFollowedPlaylists] = useState<Playlist[]>([]);
  const [loadingMy, setLoadingMy] = useState(false);
  const [loadingFollowed, setLoadingFollowed] = useState(false);
  const [myOpen, setMyOpen] = useState(true);
  const [followedOpen, setFollowedOpen] = useState(true);

  // 导航菜单项
  const navItems = [
    { name: '首页', href: '/', icon: Home },
    { name: '发现广场', href: '/discover', icon: Compass },
    { name: '我的音乐库', href: '/library', icon: Library },
  ];

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 处理创建歌单成功
  const handleCreateSuccess = (newPlaylist: any) => {
    onCreatePlaylist?.(newPlaylist);
    reloadSidebarPlaylists();
  };



  useEffect(() => {
    reloadSidebarPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // 如果用户未登录，只显示内容（不显示需要登录的功能）
  if (!user) {
    return <>{children}</>;
  }

  // 加载侧边栏歌单列表
  const reloadSidebarPlaylists = async () => {
    if (!user) return;
    try {
      setLoadingMy(true);
      const my = await getMyPlaylists({ page: 1, limit: 50 });
      setMyPlaylists(my.data ?? []);
    } catch {
      setMyPlaylists([]);
    } finally {
      setLoadingMy(false);
    }

    try {
      setLoadingFollowed(true);
      const followed = await getFollowedPlaylists({ page: 1, limit: 50 });
      setFollowedPlaylists(followed.data ?? []);
    } catch {
      // 后端可能未实现收藏接口，容错处理
      setFollowedPlaylists([]);
    } finally {
      setLoadingFollowed(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* 侧边栏 - 桌面端 */}
        <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-56 bg-white border-r border-slate-200 z-40">
          <div className="flex-1 flex flex-col py-8 px-6 overflow-y-auto">
            {/* Logo 和系统名称 */}
            <div className="mb-8 pb-6 border-b border-slate-200">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">歌单管理</h1>
                  <p className="text-xs text-slate-500">Playlist Manager</p>
                </div>
              </Link>
            </div>

            {/* 导航菜单 */}
            <nav className="flex-1 space-y-2">
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                导航
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* 我创建的歌单 */}
            <div className="mt-6">
              <button
                className="w-full flex items-center justify-between px-2 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
                onClick={() => setMyOpen(!myOpen)}
              >
                <div className="flex items-center gap-2">
                  <ListMusic className="w-5 h-5" />
                  <span className="text-sm font-medium">我创建的歌单</span>
                </div>
                {myOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {myOpen && (
                <div className="mt-2 pl-2">
                  {loadingMy ? (
                    <p className="text-xs text-slate-500 px-2 py-1">加载中...</p>
                  ) : myPlaylists.length > 0 ? (
                    <ul className="space-y-1">
                      {myPlaylists.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/playlists/${p.id}`}
                            className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm ${
                              pathname === `/playlists/${p.id}`
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span className="truncate" title={p.name}>{p.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 px-2 py-1">暂无歌单</p>
                  )}
                </div>
              )}
            </div>

            {/* 我收藏的歌单 */}
            <div className="mt-4">
              <button
                className="w-full flex items-center justify-between px-2 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
                onClick={() => setFollowedOpen(!followedOpen)}
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">我收藏的歌单</span>
                </div>
                {followedOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {followedOpen && (
                <div className="mt-2 pl-2">
                  {loadingFollowed ? (
                    <p className="text-xs text-slate-500 px-2 py-1">加载中...</p>
                  ) : followedPlaylists.length > 0 ? (
                    <ul className="space-y-1">
                      {followedPlaylists.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/playlists/${p.id}`}
                            className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm ${
                              pathname === `/playlists/${p.id}`
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span className="truncate" title={p.name}>{p.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 px-2 py-1">暂无收藏或尚未开通</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 lg:pl-56">
          <div className="min-h-screen">
            {/* 顶部导航栏 */}
            <div className="sticky top-0 z-30">
              <div className="px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 max-w-2xl">
                    {/* 搜索框 */}
                    <form onSubmit={handleSearch} className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                          type="text"
                          placeholder="搜索歌单、歌曲、歌手..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 h-9 bg-slate-50 border-slate-300 focus:border-indigo-500 focus:bg-white"
                        />
                      </div>
                    </form>
                  </div>

                  {/* 右侧：用户头像和信息 */}
                  <div className="flex items-center gap-4">
                    {/* 用户信息（桌面端显示） */}
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-medium text-slate-900">{user?.name || user?.username}</p>
                      <p className="text-xs text-slate-500">@{user?.username}</p>
                    </div>

                    {/* 用户头像（可点击） */}
                    <button
                      onClick={() => router.push('/library')}
                      className="group relative"
                    >
                      <Avatar className="h-11 w-11 border-2 border-slate-200 group-hover:border-indigo-500 transition-colors">
                        <AvatarImage src={user?.avatar ?? undefined} alt={user?.name || user?.username} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                          {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* 在线状态指示器 */}
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 页面内容 */}
            <div className="py-8 px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
