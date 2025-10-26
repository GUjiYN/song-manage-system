/**
 * 管理员后台布局组件
 */

"use client";

import { ReactNode } from 'react';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Music,
  User,
  Disc,
  LogOut,
  Users,
  Home,
  ChevronDown,
  UserCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { getDefaultRedirectPath, isAdminRole } from '@/lib/auth-redirect';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayoutWrapper>
      {children}
    </AdminLayoutWrapper>
  );
}

function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isLoading: authLoading } = useAuth();

  // 使用一个标志来防止重复重定向
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  // 侧边栏收起/展开状态
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // 滚动状态管理
  const [isScrolled, setIsScrolled] = React.useState(false);

  // 监听滚动事件
  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 检查用户是否已登录，如果未登录则重定向到��录页
  React.useEffect(() => {
    // 如果正在重定向或者还在加载认证状态，不做任何操作
    if (isRedirecting || authLoading) {
      return;
    }

    // 只有在认证加载完成后才进行权限检查
    if (!user) {
      setIsRedirecting(true);
      // 使用window.location.href直接跳转，避免React路由的问题
      window.location.href = '/auth/login';
      return;
    }

    if (!isAdminRole(user.role)) {
      setIsRedirecting(true);
      window.location.href = getDefaultRedirectPath(user.role);
      return;
    }
  }, [authLoading, user, isRedirecting]);

  // 如果认证状态还在加载中，显示加载状态
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-500">正在验证权限...</p>
        </div>
      </div>
    );
  }

  // 如果用户未登录，显示加载状态而不是渲染子组件
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-500">正在跳转到登录页...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
      current: pathname === '/admin',
    },
    {
      name: '歌曲管理',
      href: '/admin/songs',
      icon: Music,
      current: pathname === '/admin/songs',
    },
    {
      name: '歌手管理',
      href: '/admin/artists',
      icon: User,
      current: pathname === '/admin/artists',
    },
    {
      name: '专辑管理',
      href: '/admin/albums',
      icon: Disc,
      current: pathname === '/admin/albums',
    },
    {
      name: '用户管理',
      href: '/admin/users',
      icon: Users,
      current: pathname === '/admin/users',
    },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* 侧边栏 */}
      <div className={`hidden lg:flex lg:flex-col ${isSidebarCollapsed ? 'lg:w-14' : 'lg:w-48'} lg:fixed lg:inset-y-0 lg:border-r lg:border-slate-200 transition-all duration-300`}>
        {/* 顶部标题 */}
        <div className="flex items-center justify-center h-16 px-6 bg-indigo-600">
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-semibold text-indigo-50 tracking-wide">管理后台</h1>
          )}
          {isSidebarCollapsed && (
            <div className="text-indigo-50 text-2xl font-bold">A</div>
          )}
        </div>

        <nav className="flex-1 mt-8">
          <div className={`px-4 space-y-2 ${isSidebarCollapsed ? 'px-2' : ''}`}>
            {navigation.map((item) => {
              const isActive = item.current;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'
                  }`}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500'
                    }`}
                  />
                  {!isSidebarCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 收起/展开按钮 */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-slate-100 transition-colors group"
            title={isSidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
                <span className="ml-2 text-sm text-slate-600">收起侧边栏</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className={`${isSidebarCollapsed ? 'lg:pl-14' : 'lg:pl-48'} flex flex-col flex-1 transition-all duration-300`}>

        {/* 桌面端顶部导航栏 */}
        <header className={`hidden lg:block sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/40 backdrop-blur-md '
            : 'bg-transparent'
        }`}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              {/* 面包屑 */}
              <nav className="flex">
                <ol className="flex items-center space-x-2 text-sm text-slate-500">
                  <li>
                    <Link href="/admin" className="hover:text-slate-700">
                      首页
                    </Link>
                  </li>
                  <li>/</li>
                  <li className="text-slate-700">
                    {navigation.find(item => item.current)?.name || '管理后台'}
                  </li>
                </ol>
              </nav>

              {/* 用户头像下拉菜单 */}
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center p-2 rounded-lg hover:bg-slate-100 transition-colors group">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={user.avatar ?? undefined} alt={user.name || user.username} />
                        <AvatarFallback>
                          {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="ml-2 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <div className="px-2 py-1.5 text-sm text-slate-500 border-b border-slate-100">
                      管理员账户
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/" className="flex items-center cursor-pointer">
                        <Home className="h-4 w-4 mr-2 text-green-600" />
                        <span>访问前台首页</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center cursor-pointer">
                      <UserCircle className="h-4 w-4 mr-2 text-slate-600" />
                      <span>个人资料</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>退出登录</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1">
          <div className="pt-2 pb-6">
            <div className="w-full px-2 sm:px-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
