"use client";

import { useEffect, useState } from "react";
import { getPlaylistById } from "@/services/client/playlist";
import type { Playlist, Song } from "@/types/playlist";
import { Music } from "lucide-react";

interface PlaylistDetailInlineProps {
  id: number;
}

export function PlaylistDetailInline({ id }: PlaylistDetailInlineProps) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getPlaylistById(id);
        if (mounted) setPlaylist(data);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-9 w-24 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-40 bg-slate-200 rounded-lg animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <Music className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">加载失败</h2>
        <p className="text-slate-600 mb-6">{error.message}</p>
      </div>
    );
  }

  if (!playlist) return null;

  const songs: Song[] | undefined = playlist.songs as unknown as Song[] | undefined;

  return (
    <div className="space-y-6">
      {/* 顶部信息：简洁横向布局（无卡片） */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-5 min-w-0">
          <div className="w-36 h-36 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center shadow-sm border border-slate-200">
            {playlist.coverUrl ? (
              <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <Music className="w-10 h-10 text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 truncate">{playlist.name}</h1>
            <p className="text-slate-600 text-sm mt-1 truncate">
              创建者：{playlist.creator?.username || (playlist as unknown as { creator?: { name?: string } }).creator?.name || "未知"}
            </p>
            <p className="text-slate-500 text-sm mt-1 line-clamp-2">
              {playlist.description || "这个歌单还没有简介~"}
            </p>
          </div>
        </div>
      </div>

      {/* 歌曲列表：去卡片化，表格行样式 */}
      <div className="mt-2">
        <div className="px-2 text-slate-500 text-xs font-medium grid grid-cols-[56px_1fr_1fr_72px] gap-2 h-8 items-center">
          <div className="pl-3">#</div>
          <div>标题</div>
          <div>专辑</div>
          <div className="text-right pr-3">时长</div>
        </div>
        <div className="border-t border-slate-200" />

        {songs && songs.length > 0 ? (
          <ul>
            {songs.map((s, idx) => (
              <li
                key={s.id}
                className="grid grid-cols-[56px_1fr_1fr_72px] gap-2 items-center h-14 hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <div className="pl-3 text-slate-400 text-sm tabular-nums">{String(idx + 1).padStart(2, '0')}</div>
                <div className="min-w-0 flex items-center gap-3">
                  {/* 小封面（若有专辑封面则显示；没有则留白占位）*/}
                  <div className="w-10 h-10 rounded bg-slate-200 overflow-hidden flex-shrink-0 hidden">
                    {/* 预留：若未来 song 有封面可显示 */}
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-900 truncate">{s.title}</p>
                    <p className="text-slate-500 text-xs truncate">{s.artist?.name}</p>
                  </div>
                </div>
                <div className="text-slate-600 truncate">{s.album?.title ?? '-'}</div>
                <div className="text-right pr-3 text-slate-500 text-sm tabular-nums">{s.duration ?? '--:--'}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-14 text-center text-slate-500">暂无歌曲</div>
        )}
      </div>
    </div>
  );
}
