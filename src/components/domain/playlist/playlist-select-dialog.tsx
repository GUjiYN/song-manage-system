/**
 * 歌单选择弹窗组件
 * 用于选择要添加歌曲的歌单
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaylistCard } from './playlist-card';
import { getMyPlaylists } from '@/services/client/playlist';
import { addSongToPlaylist } from '@/services/client/playlist';
import type { Song, Playlist } from '@/types/playlist';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { Search, Music } from 'lucide-react';

interface PlaylistSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: Song | null;
}

export function PlaylistSelectDialog({ open, onOpenChange, song }: PlaylistSelectDialogProps) {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // 获取用户歌单列表
  const loadPlaylists = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await getMyPlaylists({ limit: 50 }); // 获取最多50个歌单
      setPlaylists(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取歌单列表失败';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 当弹窗打开时加载歌单列表
  useEffect(() => {
    if (open && user) {
      loadPlaylists();
      setSearchTerm('');
      setSelectedPlaylistId(null);
    }
  }, [open, user]);

  // 过滤歌单
  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    playlist.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 处理选择歌单
  const handleSelectPlaylist = async (playlistId: number) => {
    if (!song || !user) return;

    setIsAdding(true);
    setSelectedPlaylistId(playlistId);

    try {
      await addSongToPlaylist(playlistId, song.id);

      const selectedPlaylist = playlists.find(p => p.id === playlistId);
      toast.success(`已收藏到歌单"${selectedPlaylist?.name}"`);

      // 关闭弹窗
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '添加到歌单失败';
      toast.error(errorMessage);
    } finally {
      setIsAdding(false);
      setSelectedPlaylistId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            添加到歌单
          </DialogTitle>
          <DialogDescription>
            选择一个歌单来添加这首歌
          </DialogDescription>
        </DialogHeader>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="搜索我的歌单..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 歌单列表 */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {!user ? (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-3">请先登录</p>
              <p className="text-slate-400 text-xs">
                登录后即可将歌曲添加到你的歌单
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-slate-500">加载中...</div>
            </div>
          ) : filteredPlaylists.length === 0 ? (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                {searchTerm ? '没有找到匹配的歌单' : '还没有创建任何歌单'}
              </p>
              {!searchTerm && (
                <p className="text-slate-400 text-xs mt-1">
                  前往音乐库页面创建你的第一个歌单
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300 ${
                    selectedPlaylistId === playlist.id ? 'bg-indigo-50 border-indigo-200' : 'border-slate-200'
                  }`}
                  onClick={() => handleSelectPlaylist(playlist.id)}
                >
                  <div className="flex items-center gap-3">
                    {/* 歌单封面 */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                      {playlist.coverUrl ? (
                        <img
                          src={playlist.coverUrl}
                          alt={playlist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* 歌单信息 */}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-slate-900 truncate">
                        {playlist.name}
                      </h4>
                      {playlist.description && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {playlist.description}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {playlist._count?.songs || 0} 首歌曲
                      </p>
                    </div>

                    {/* 加载状态 */}
                    {selectedPlaylistId === playlist.id && isAdding && (
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部信息 */}
        {song && (
          <div className="pt-3 mt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              将添加: <span className="font-medium">{song.title}</span> - {song.artist?.name}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}