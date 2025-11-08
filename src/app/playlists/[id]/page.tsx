/**
 * 歌单详情页面
 * 路由：/playlists/[id]
 */

import { notFound } from 'next/navigation';
import { PlaylistDetailPage } from '@/components/domain/playlist/playlist-detail-page';

interface PlaylistPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params;
  const playlistId = parseInt(id, 10);

  // 验证ID是否为有效数字
  if (isNaN(playlistId)) {
    notFound();
  }

  try {
    // 获取歌单详情数据 - 在服务器端使用完整URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/playlists/${playlistId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error(`Failed to fetch playlist: ${response.status}`);
    }

    const result = await response.json();
    const playlist = result.data;

    return <PlaylistDetailPage playlist={playlist} />;
  } catch (error) {
    console.error('Failed to load playlist:', error);
    notFound();
  }
}