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
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* 侧边栏 */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:shadow-lg lg:bg-white lg:border-r lg:border-slate-200">
        <div className="flex items-center justify-center h-16 px-6 bg-indigo-600">
          <h1 className="text-xl font-semibold text-indigo-50 tracking-wide">管理后台</h1>
        </div>

        <nav className="flex-1 mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = item.current;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user.avatar ?? undefined} alt={user.name || user.username} />
              <AvatarFallback>
                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user.name || user.username}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="ml-2 flex-shrink-0 text-slate-500 hover:text-indigo-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* 移动端顶部栏 */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200">
            <div className="flex items-center">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="ml-3 text-lg font-semibold text-slate-800">管理后台</h1>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar ?? undefined} alt={user.name || user.username} />
              <AvatarFallback>
                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* 桌面端顶部导航栏 */}
        <header className="hidden lg:block bg-white shadow-sm border-b border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
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
            </div>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
