/**
 * 管理员首页 Dashboard
 */

"use client";

import { useState, useEffect } from 'react';
import { BarChart3, Music, User, Disc, TrendingUp, Users, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

// 统计数据类型
interface SystemStats {
  totalSongs: number;
  totalArtists: number;
  totalAlbums: number;
  totalPlaylists: number;
  totalUsers: number;
  recentActivity?: Array<{
    id: number;
    type: 'song' | 'artist' | 'album' | 'playlist' | 'user';
    action: 'created' | 'updated' | 'deleted';
    name: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 模拟加载统计数据
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: 替换为实际的API调用
        // const response = await fetch('/api/admin/stats');
        // const data = await response.json();
        // setStats(data);

        // 模拟数据
        setTimeout(() => {
          setStats({
            totalSongs: 156,
            totalArtists: 28,
            totalAlbums: 42,
            totalPlaylists: 89,
            totalUsers: 234,
            recentActivity: [
              {
                id: 1,
                type: 'song',
                action: 'created',
                name: '夜的第七章',
                timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
              },
              {
                id: 2,
                type: 'artist',
                action: 'created',
                name: '周杰伦',
                timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
              },
              {
                id: 3,
                type: 'playlist',
                action: 'created',
                name: '我的最爱',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              },
            ],
          });
          setIsLoading(false);
        }, 1000);

      } catch (err) {
        setError(err instanceof Error ? err : new Error('加载统计数据失败'));
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: '歌曲总数',
      value: stats?.totalSongs || 0,
      icon: Music,
      color: 'bg-indigo-500',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: '歌手总数',
      value: stats?.totalArtists || 0,
      icon: User,
      color: 'bg-teal-500',
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      title: '专辑总数',
      value: stats?.totalAlbums || 0,
      icon: Disc,
      color: 'bg-sky-500',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: '歌单总数',
      value: stats?.totalPlaylists || 0,
      icon: BarChart3,
      color: 'bg-amber-500',
      change: '+15%',
      changeType: 'positive' as const,
    },
    {
      title: '用户总数',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-rose-500',
      change: '+22%',
      changeType: 'positive' as const,
    },
  ];

  // 加载状态
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500">系统概览和统计信息</p>
          </div>
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse"></div>
        </div>

        {/* 统计卡片骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-slate-200 rounded-lg animate-pulse"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-slate-200 rounded animate-pulse mb-2"></div>
                  <div className="h-6 bg-slate-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 最近活动骨架 */}
        <Card className="p-6">
          <div className="h-6 bg-slate-200 rounded animate-pulse mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-rose-600 mb-2">加载失败</h2>
          <p className="text-slate-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'song':
        return <Music className="h-4 w-4 text-indigo-500" />;
      case 'artist':
        return <User className="h-4 w-4 text-teal-500" />;
      case 'album':
        return <Disc className="h-4 w-4 text-sky-500" />;
      case 'playlist':
        return <BarChart3 className="h-4 w-4 text-amber-500" />;
      case 'user':
        return <Users className="h-4 w-4 text-rose-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getActivityText = (activity: any) => {
    const actionText = {
      created: '创建了',
      updated: '更新了',
      deleted: '删除了',
    };

    const typeText = {
      song: '歌曲',
      artist: '歌手',
      album: '专辑',
      playlist: '歌单',
      user: '用户',
    };

    return `${actionText[activity.action]}${typeText[activity.type]}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return `${Math.floor(diffInMinutes / 1440)}天前`;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">系统概览和统计信息</p>
        </div>
        <div className="flex items-center text-sm text-slate-500">
          <TrendingUp className="h-4 w-4 mr-1 text-emerald-500" />
          系统运行正常
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-xl shadow-sm`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                <div className={`flex items-center text-xs mt-1 ${
                  card.changeType === 'positive' ? 'text-emerald-600' : 'text-rose-500'
                }`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {card.change}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 最近活动 */}
      <Card className="p-6 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">最近活动</h2>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 hover:bg-indigo-50/60 rounded-lg transition-colors">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {getActivityText(activity)} "{activity.name}"
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">暂无最近活动</p>
          </div>
        )}
      </Card>
    </div>
  );
}
