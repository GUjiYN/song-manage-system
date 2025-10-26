/**
 * Top 排行榜组件
 */
import { Card } from '@/components/ui/card';
import { Music, User, List } from 'lucide-react';

interface TopSong {
  id: number;
  title: string;
  cover: string | null;
  artist: string;
  playlistCount: number;
}

interface TopArtist {
  id: number;
  name: string;
  avatar: string | null;
  songCount: number;
}

interface TopUser {
  id: number;
  name: string;
  avatar: string | null;
  playlistCount: number;
}

interface TopRankingsProps {
  topSongs: TopSong[];
  topArtists: TopArtist[];
  topUsers: TopUser[];
}

export function TopRankings({ topSongs, topArtists, topUsers }: TopRankingsProps) {
  return (
    <div className="space-y-5">
      {/* 最受欢迎歌曲 - 全宽 */}
      <div className="backdrop-blur-sm bg-gradient-to-br from-indigo-50/70 to-purple-50/40 rounded-2xl p-4 border border-indigo-200/40">
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
          <div className="bg-indigo-100 p-1.5 rounded-lg mr-2">
            <Music className="h-5 w-5 text-indigo-600" />
          </div>
          最受欢迎歌曲 Top 5
        </h3>
        <div className="space-y-2">
          {topSongs.slice(0, 5).map((song, index) => (
            <div
              key={song.id}
              className="flex items-center gap-3 p-2 hover:bg-indigo-50/40 rounded-lg transition-colors group"
            >
              <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                <span className={`text-base font-bold ${
                  index === 0 ? 'text-amber-500' :
                  index === 1 ? 'text-slate-400' :
                  index === 2 ? 'text-amber-700' :
                  'text-slate-300'
                }`}>
                  {index + 1}
                </span>
              </div>
              {song.cover ? (
                <img
                  src={song.cover}
                  alt={song.title}
                  className="w-11 h-11 rounded-md object-cover shadow-sm"
                />
              ) : (
                <div className="w-11 h-11 bg-slate-200 rounded-md flex items-center justify-center">
                  <Music className="w-5 h-5 text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{song.title}</p>
                <p className="text-xs text-slate-500 truncate">{song.artist}</p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                  {song.playlistCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 热门歌手和活跃用户 - 2列布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 热门歌手 */}
        <div className="backdrop-blur-sm bg-gradient-to-br from-teal-50/70 to-emerald-50/40 rounded-2xl p-4 border border-teal-200/40">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <div className="bg-teal-100 p-1.5 rounded-lg mr-2">
              <User className="h-5 w-5 text-teal-600" />
            </div>
            热门歌手 Top 5
          </h3>
          <div className="space-y-2">
            {topArtists.map((artist, index) => (
              <div
                key={artist.id}
                className="flex items-center gap-3 p-2 hover:bg-teal-50/40 rounded-lg transition-colors group"
              >
                <div className="flex-shrink-0 w-6 text-center">
                  <span className="text-sm font-bold text-slate-400">{index + 1}</span>
                </div>
                {artist.avatar ? (
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-9 h-9 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-teal-600 transition-colors">{artist.name}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">{artist.songCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最活跃用户 */}
        <div className="backdrop-blur-sm bg-gradient-to-br from-rose-50/70 to-pink-50/40 rounded-2xl p-4 border border-rose-200/40">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <div className="bg-rose-100 p-1.5 rounded-lg mr-2">
              <List className="h-5 w-5 text-rose-600" />
            </div>
            最活跃用户 Top 5
          </h3>
          <div className="space-y-2">
            {topUsers.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 hover:bg-rose-50/40 rounded-lg transition-colors group"
              >
                <div className="flex-shrink-0 w-6 text-center">
                  <span className="text-sm font-bold text-slate-400">{index + 1}</span>
                </div>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-rose-600 transition-colors">{user.name}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">{user.playlistCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
