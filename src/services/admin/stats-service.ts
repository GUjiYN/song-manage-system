import { prisma } from '@/lib/prisma';

/**
 * 系统统计数据类型
 */
export interface SystemStats {
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

/**
 * 计算增长率
 */
function calculateGrowthRate(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%';
  }

  const growth = ((current - previous) / previous) * 100;
  const rounded = Math.round(growth * 10) / 10; // 保留1位小数

  if (rounded > 0) {
    return `+${rounded}%`;
  } else if (rounded < 0) {
    return `${rounded}%`;
  } else {
    return '0%';
  }
}

/**
 * 获取系统统计数据
 */
export async function getSystemStats(): Promise<SystemStats> {
  // 30天前的日期
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 并行查询所有统计数据
  const [
    totalSongs,
    totalArtists,
    totalAlbums,
    totalPlaylists,
    totalUsers,
    songsBefore30Days,
    artistsBefore30Days,
    albumsBefore30Days,
    playlistsBefore30Days,
    usersBefore30Days,
  ] = await Promise.all([
    // 当前总数
    prisma.song.count(),
    prisma.artist.count(),
    prisma.album.count(),
    prisma.playlist.count(),
    prisma.user.count(),

    // 30天前的总数(当前总数 - 30天内新增数)
    prisma.song.count().then(async (total) => {
      const newCount = await prisma.song.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      });
      return total - newCount;
    }),
    prisma.artist.count().then(async (total) => {
      const newCount = await prisma.artist.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      });
      return total - newCount;
    }),
    prisma.album.count().then(async (total) => {
      const newCount = await prisma.album.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      });
      return total - newCount;
    }),
    prisma.playlist.count().then(async (total) => {
      const newCount = await prisma.playlist.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      });
      return total - newCount;
    }),
    prisma.user.count().then(async (total) => {
      const newCount = await prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      });
      return total - newCount;
    }),
  ]);

  // 计算增长率
  const growth = {
    songs: calculateGrowthRate(totalSongs, songsBefore30Days),
    artists: calculateGrowthRate(totalArtists, artistsBefore30Days),
    albums: calculateGrowthRate(totalAlbums, albumsBefore30Days),
    playlists: calculateGrowthRate(totalPlaylists, playlistsBefore30Days),
    users: calculateGrowthRate(totalUsers, usersBefore30Days),
  };

  // 并行获取其他数据
  const [recentActivity, topSongs, topArtists, topUsers, dataQuality, trendData] = await Promise.all([
    getRecentActivities(),
    getTopSongs(),
    getTopArtists(),
    getTopUsers(),
    getDataQuality(),
    getTrendData(),
  ]);

  return {
    totalSongs,
    totalArtists,
    totalAlbums,
    totalPlaylists,
    totalUsers,
    growth,
    recentActivity,
    topSongs,
    topArtists,
    topUsers,
    dataQuality,
    trendData,
  };
}

/**
 * 获取最近活动列表
 */
async function getRecentActivities() {
  // 并行查询各类型的最近记录
  const [recentSongs, recentArtists, recentAlbums, recentPlaylists, recentUsers] = await Promise.all([
    prisma.song.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.artist.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.album.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.playlist.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  // 合并所有活动并转换格式
  const activities: Array<{
    id: number;
    type: 'song' | 'artist' | 'album' | 'playlist' | 'user';
    action: 'created' | 'updated' | 'deleted';
    name: string;
    timestamp: string;
  }> = [];

  // 添加歌曲活动
  recentSongs.forEach(song => {
    activities.push({
      id: song.id,
      type: 'song',
      action: 'created',
      name: song.title,
      timestamp: song.createdAt.toISOString(),
    });
  });

  // 添加歌手活动
  recentArtists.forEach(artist => {
    activities.push({
      id: artist.id,
      type: 'artist',
      action: 'created',
      name: artist.name,
      timestamp: artist.createdAt.toISOString(),
    });
  });

  // 添加专辑活动
  recentAlbums.forEach(album => {
    activities.push({
      id: album.id,
      type: 'album',
      action: 'created',
      name: album.title,
      timestamp: album.createdAt.toISOString(),
    });
  });

  // 添加歌单活动
  recentPlaylists.forEach(playlist => {
    activities.push({
      id: playlist.id,
      type: 'playlist',
      action: 'created',
      name: playlist.name,
      timestamp: playlist.createdAt.toISOString(),
    });
  });

  // 添加用户活动
  recentUsers.forEach(user => {
    activities.push({
      id: user.id,
      type: 'user',
      action: 'created',
      name: user.name || user.username,
      timestamp: user.createdAt.toISOString(),
    });
  });

  // 按时间倒序排序,取最近的15条
  activities.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return activities.slice(0, 15);
}

/**
 * 获取Top歌曲(被收藏次数最多)
 */
async function getTopSongs() {
  const songs = await prisma.song.findMany({
    select: {
      id: true,
      title: true,
      cover: true,
      artist: {
        select: {
          name: true,
        },
      },
      playlistSongs: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      playlistSongs: {
        _count: 'desc',
      },
    },
    take: 10,
  });

  return songs.map(song => ({
    id: song.id,
    title: song.title,
    cover: song.cover,
    artist: song.artist.name,
    playlistCount: song.playlistSongs.length,
  }));
}

/**
 * 获取Top歌手(歌曲数量最多)
 */
async function getTopArtists() {
  const artists = await prisma.artist.findMany({
    select: {
      id: true,
      name: true,
      avatar: true,
      songs: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      songs: {
        _count: 'desc',
      },
    },
    take: 5,
  });

  return artists.map(artist => ({
    id: artist.id,
    name: artist.name,
    avatar: artist.avatar,
    songCount: artist.songs.length,
  }));
}

/**
 * 获取Top用户(创建歌单最多)
 */
async function getTopUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      playlists: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      playlists: {
        _count: 'desc',
      },
    },
    take: 5,
  });

  return users.map(user => ({
    id: user.id,
    name: user.name || user.username,
    avatar: user.avatar,
    playlistCount: user.playlists.length,
  }));
}

/**
 * 获取数据质量检查
 */
async function getDataQuality() {
  const [songsWithoutCover, songsWithoutDuration, emptyAlbums, emptyPlaylists] = await Promise.all([
    // 没有封面的歌曲
    prisma.song.count({
      where: {
        OR: [
          { cover: null },
          { cover: '' },
        ],
      },
    }),

    // 没有时长的歌曲
    prisma.song.count({
      where: {
        OR: [
          { duration: null },
          { duration: '' },
        ],
      },
    }),

    // 没有歌曲的专辑
    prisma.album.count({
      where: {
        songs: {
          none: {},
        },
      },
    }),

    // 没有歌曲的歌单
    prisma.playlist.count({
      where: {
        playlistSongs: {
          none: {},
        },
      },
    }),
  ]);

  return {
    songsWithoutCover,
    songsWithoutDuration,
    emptyAlbums,
    emptyPlaylists,
  };
}

/**
 * 获取趋势数据
 */
async function getTrendData() {
  // 获取最近30天的每日统计
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 生成30天的日期数组
  const dates: Date[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }

  // 查询每天创建的歌曲和用户数
  const dailyStats = await Promise.all(
    dates.map(async (date) => {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [songs, users] = await Promise.all([
        prisma.song.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
      ]);

      return {
        date: date.toISOString().split('T')[0], // YYYY-MM-DD
        songs,
        users,
      };
    })
  );

  // 获取分类分布
  const categories = await prisma.category.findMany({
    select: {
      name: true,
      songs: {
        select: {
          id: true,
        },
      },
    },
  });

  const categoryDistribution = categories.map(category => ({
    name: category.name,
    count: category.songs.length,
  }));

  return {
    dailyStats,
    categoryDistribution,
  };
}
