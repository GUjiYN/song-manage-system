/**
 * 管理员首页 Dashboard
 */

"use client";

import { useState, useEffect } from 'react';
import { BarChart3, Music, User, Disc, TrendingUp, Users, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TopRankings } from '@/components/admin/TopRankings';
import { TrendCharts } from '@/components/admin/TrendCharts';
import { DataQualityCheck } from '@/components/admin/DataQualityCheck';

// 统计数据类型
interface SystemStats {
  totalSongs: number;
  totalArtists: number;
  totalAlbums: number;
  totalPlaylists: number;
  totalUsers: number;
  growth: {
    songs: string;
    artists: string;
    albums: string;
    playlists: string;
    users: string;
  };
  recentActivity: Array<{
    id: number;
    type: 'song' | 'artist' | 'album' | 'playlist' | 'user';
    action: 'created' | 'updated' | 'deleted';
    name: string;
    timestamp: string;
  }>;
  topSongs: Array<{
    id: number;
    title: string;
    cover: string | null;
    artist: string;
    playlistCount: number;
  }>;
  topArtists: Array<{
    id: number;
    name: string;
    avatar: string | null;
    songCount: number;
  }>;
  topUsers: Array<{
    id: number;
    name: string;
    avatar: string | null;
    playlistCount: number;
  }>;
  dataQuality: {
    songsWithoutCover: number;
    songsWithoutDuration: number;
    emptyAlbums: number;
    emptyPlaylists: number;
  };
  trendData: {
    dailyStats: Array<{
      date: string;
      songs: number;
      users: number;
    }>;
    categoryDistribution: Array<{
      name: string;
      count: number;
    }>;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 加载统计数据
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 调用真实API
        const response = await fetch('/api/admin/stats');

        if (!response.ok) {
          throw new Error('获取统计数据失败');
        }

        const result = await response.json();
        setStats(result.data);

      } catch (err) {
        setError(err instanceof Error ? err : new Error('加载统计数据失败'));
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  // 辅助函数:根据增长率字符串判断类型
  const getChangeType = (growth?: string): 'positive' | 'negative' | 'neutral' => {
    if (!growth) return 'neutral';
    if (growth.startsWith('+')) return 'positive';
    if (growth.startsWith('-')) return 'negative';
    return 'neutral';
  };

  const statCards = [
    {
      title: '歌曲总数',
      value: stats?.totalSongs || 0,
      icon: Music,
      color: 'bg-indigo-500',
      change: stats?.growth.songs || '0%',
      changeType: getChangeType(stats?.growth.songs),
    },
    {
      title: '歌手总数',
      value: stats?.totalArtists || 0,
      icon: User,
      color: 'bg-teal-500',
      change: stats?.growth.artists || '0%',
      changeType: getChangeType(stats?.growth.artists),
    },
    {
      title: '专辑总数',
      value: stats?.totalAlbums || 0,
      icon: Disc,
      color: 'bg-sky-500',
      change: stats?.growth.albums || '0%',
      changeType: getChangeType(stats?.growth.albums),
    },
    {
      title: '歌单总数',
      value: stats?.totalPlaylists || 0,
      icon: BarChart3,
      color: 'bg-amber-500',
      change: stats?.growth.playlists || '0%',
      changeType: getChangeType(stats?.growth.playlists),
    },
    {
      title: '用户总数',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-rose-500',
      change: stats?.growth.users || '0%',
      changeType: getChangeType(stats?.growth.users),
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

  const getActivityText = (activity: SystemStats['recentActivity'][number]) => {
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
    <div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-slate-500 mt-1">系统概览和统计信息</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
          <TrendingUp className="h-4 w-4" />
          系统运行正常
        </div>
      </div>

      {/* 统计卡片 - 渐变背景 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${
              index === 0 ? 'from-indigo-500 to-indigo-600' :
              index === 1 ? 'from-teal-500 to-teal-600' :
              index === 2 ? 'from-sky-500 to-sky-600' :
              index === 3 ? 'from-amber-500 to-amber-600' :
              'from-rose-500 to-rose-600'
            } shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            {/* 装饰背景 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

            <div className="relative flex items-center">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-white/80">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
                <div className="flex items-center text-xs mt-2 text-white/90">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {card.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 数据质量检查 */}
      {stats && <DataQualityCheck dataQuality={stats.dataQuality} />}

      {/* 数据趋势图 */}
      {stats && <TrendCharts trendData={stats.trendData} />}

      {/* Top 排行榜 和 最近活动 (2列布局) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧: Top 排行榜 (2列) */}
        <div className="lg:col-span-2">
          {stats && (
            <TopRankings
              topSongs={stats.topSongs}
              topArtists={stats.topArtists}
              topUsers={stats.topUsers}
            />
          )}
        </div>

        {/* 右侧: 最近活动 (1列) */}
        <div className="lg:col-span-1">
          <div className="backdrop-blur-sm bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-2xl p-4 border border-amber-200/40 shadow-lg h-full">
            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
              <div className="bg-amber-100 p-1.5 rounded-lg mr-2">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              最近活动
            </h2>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2.5 hover:bg-white/60 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">
                        {getActivityText(activity)} &quot;{activity.name}&quot;
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">暂无最近活动</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
