/**
 * 主布局组件 - 包含侧边栏和顶部导航
 * 用于所有用户页面（首页、发现广场、搜索、我的音乐库等）
 */

"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Music, ListMusic, Heart, Compass, Library, Home, ChevronRight, ChevronDown, Plus, ArrowLeft, ChevronDown as ChevronDownIcon, User, LogOut, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { PlaylistDialog } from '@/components/domain/playlist/playlist-dialog';
import { PlaylistDetailInline } from '@/components/domain/playlist/playlist-detail-inline';
import { useAuth } from '@/contexts/auth-context';
import { getMyPlaylists, getFollowedPlaylists } from '@/services/client/playlist';
import type { Playlist } from '@/types/playlist';
import { UserRole } from '@/types/auth';

interface MainLayoutProps {
  children: ReactNode;
  onCreatePlaylist?: (playlist: Playlist) => void;
}

export function MainLayout({ children, onCreatePlaylist }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  // 预留移动端侧边栏开关（当前未使用）
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [followedPlaylists, setFollowedPlaylists] = useState<Playlist[]>([]);
  const [loadingMy, setLoadingMy] = useState(false);
  const [loadingFollowed, setLoadingFollowed] = useState(false);
  const [myOpen, setMyOpen] = useState(true);
  const [followedOpen, setFollowedOpen] = useState(true);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);

  // 滚动状态
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollShadow, setShowScrollShadow] = useState(false);

  // 导航菜单
  const navItems = useMemo(
    () => [
      { name: '首页', href: '/', icon: Home },
      { name: '发现广场', href: '/discover', icon: Compass },
      { name: '我的音乐库', href: '/library', icon: Library },
    ], []
  );

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 加载侧边栏歌单列表（useCallback，未登录短路）
  const reloadSidebarPlaylists = useCallback(async () => {
    if (!user?.id) return;
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
  }, [user?.id]);

  // 处理创建歌单成功
  const handleCreateSuccess = (newPlaylist: Playlist) => {
    onCreatePlaylist?.(newPlaylist);
    reloadSidebarPlaylists();
  };

  useEffect(() => {
    reloadSidebarPlaylists();
  }, [reloadSidebarPlaylists]);

  // 监听滚动事件，实现毛玻璃效果
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
      setShowScrollShadow(scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初始化状态

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 监听全局事件，允许子页面触发内嵌详情
  useEffect(() => {
    const openHandler = (e: Event) => {
      const custom = e as CustomEvent<number>;
      setSelectedPlaylistId(custom.detail);
    };
    window.addEventListener('open-playlist-inline' as unknown as string, openHandler as EventListener);
    return () => {
      window.removeEventListener('open-playlist-inline' as unknown as string, openHandler as EventListener);
    };
  }, []);

  // 如果用户未登录，只显示内容（不显示需要登录的功能）
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* 侧边栏 - 桌面端 */}
        <aside className="flex flex-col fixed inset-y-0 w-56 bg-white border-r border-slate-200 z-40">
          <div className="flex-1 flex flex-col py-8 px-4 overflow-y-auto">
            {/* Logo 和系统名 */}
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
              <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                导航
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="whitespace-nowrap">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* 我创建的歌单 */}
            <div className="mt-6">
              <div className="w-full flex items-center justify-between px-2 py-2 text-slate-700">
                <button
                  className="flex items-center gap-2 hover:bg-slate-100 rounded-md py-2 px-0"
                  onClick={() => setMyOpen(!myOpen)}
                >
                  <ListMusic className="w-5 h-5" />
                  <span className="text-sm font-medium whitespace-nowrap">我创建的歌单</span>
                  {myOpen ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
                </button>

                <PlaylistDialog onCreateSuccess={handleCreateSuccess}>
                  <button
                    aria-label="创建歌单"
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </PlaylistDialog>
              </div>
              {myOpen && (
                <div className="mt-2 pl-2">
                  {loadingMy ? (
                    <p className="text-xs text-slate-500 px-2 py-1">加载中...</p>
                  ) : myPlaylists.length > 0 ? (
                    <ul className="space-y-1">
                      {myPlaylists.map((p) => (
                        <li key={p.id}>
                          <button
                            onClick={() => setSelectedPlaylistId(p.id)}
                            className={`w-full text-left flex items-center gap-2 px-2 py-2 rounded-md text-sm ${
                              selectedPlaylistId === p.id
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span className="truncate" title={p.name}>{p.name}</span>
                          </button>
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
                className="w-full flex items-center gap-2 px-2 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
                onClick={() => setFollowedOpen(!followedOpen)}
              >
                <Heart className="w-5 h-5" />
                <span className="text-sm font-medium whitespace-nowrap">我收藏的歌单</span>
                {followedOpen ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
              </button>
              {followedOpen && (
                <div className="mt-2 pl-2">
                  {loadingFollowed ? (
                    <p className="text-xs text-slate-500 px-2 py-1">加载中...</p>
                  ) : followedPlaylists.length > 0 ? (
                    <ul className="space-y-1">
                      {followedPlaylists.map((p) => (
                        <li key={p.id}>
                          <button
                            onClick={() => setSelectedPlaylistId(p.id)}
                            className={`w-full text-left flex items-center gap-2 px-2 py-2 rounded-md text-sm ${
                              selectedPlaylistId === p.id
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span className="truncate" title={p.name}>{p.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 px-2 py-1">暂无收藏</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 pl-56">
          <div className="min-h-screen">
            {/* 顶部导航 */}
            <div className={`sticky top-0 z-30 transition-all duration-300 ${
              isScrolled
                ? 'fixed top-0 left-56 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm'
                : 'bg-transparent'
            } ${showScrollShadow ? 'shadow-md' : ''}`}>
              <div className={`px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
                isScrolled ? 'py-2' : 'py-3'
              }`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 max-w-2xl">
                    {/* 返回按钮（全局） */}
                    <button
                      onClick={() => router.back()}
                      aria-label="返回"
                      className="p-2 rounded-md hover:bg-slate-100 text-slate-600 hover:text-indigo-700"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    {/* 搜索 */}
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
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">{user?.name || user?.username}</p>
                      <p className="text-xs text-slate-500">@{user?.username}</p>
                    </div>

                    {/* 用户头像下拉菜单 */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="group relative flex items-center gap-1">
                          <Avatar className="h-11 w-11 border-2 border-slate-200 group-hover:border-indigo-500 transition-colors">
                            <AvatarImage src={user?.avatar ?? undefined} alt={user?.name || user?.username} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                              {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <ChevronDownIcon className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {/* 用户信息显示 */}
                        <div className="px-2 py-2 border-b border-slate-100">
                          <p className="text-sm font-medium text-slate-900">{user?.name || user?.username}</p>
                          <p className="text-xs text-slate-500">@{user?.username}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER ? '管理员' : '普通用户'}
                          </p>
                        </div>

                        {/* 菜单项 */}
                        <DropdownMenuItem onClick={() => router.push('/library')} className="cursor-pointer">
                          <User className="w-4 h-4 mr-2" />
                          个人中心
                        </DropdownMenuItem>

                        {/* 管理员专用菜单项 */}
                        {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && (
                          <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer">
                            <Settings className="w-4 h-4 mr-2" />
                            后台管理
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
                          <LogOut className="w-4 h-4 mr-2" />
                          退出登录
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>

            {/* 页面主体内容：若选择了侧边栏歌单，则在当前页渲染详情 */}
            <div className={`px-6 py-6 transition-all duration-300 ${
              isScrolled ? 'mt-16' : 'mt-0'
            }`}>
              {selectedPlaylistId ? (
                <PlaylistDetailInline id={selectedPlaylistId} />
              ) : (
                children
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
