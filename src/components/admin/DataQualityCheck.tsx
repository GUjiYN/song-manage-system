/**
 * 数据质量检查组件
 */
import { Card } from '@/components/ui/card';
import { AlertCircle, Music, Clock, Disc, List } from 'lucide-react';

interface DataQuality {
  songsWithoutCover: number;
  songsWithoutDuration: number;
  emptyAlbums: number;
  emptyPlaylists: number;
}

interface DataQualityCheckProps {
  dataQuality: DataQuality;
}

export function DataQualityCheck({ dataQuality }: DataQualityCheckProps) {
  const issues = [
    {
      title: '缺失封面',
      description: '歌曲没有封面图片',
      count: dataQuality.songsWithoutCover,
      icon: Music,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    },
    {
      title: '缺失时长',
      description: '歌曲没有时长信息',
      count: dataQuality.songsWithoutDuration,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      title: '空专辑',
      description: '专辑中没有歌曲',
      count: dataQuality.emptyAlbums,
      icon: Disc,
      color: 'text-sky-500',
      bgColor: 'bg-sky-50',
    },
    {
      title: '空歌单',
      description: '歌单中没有歌曲',
      count: dataQuality.emptyPlaylists,
      icon: List,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
    },
  ];

  const totalIssues = Object.values(dataQuality).reduce((sum, count) => sum + count, 0);

  return (
    <div className="backdrop-blur-sm bg-white/60 rounded-2xl p-4 border border-white/70 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
          数据质量检查
        </h3>
        {totalIssues > 0 ? (
          <span className="text-sm text-amber-700 bg-amber-100/80 backdrop-blur-sm px-3 py-1 rounded-full font-medium border border-amber-200">
            发现 {totalIssues} 个问题
          </span>
        ) : (
          <span className="text-sm text-emerald-700 bg-emerald-100/80 backdrop-blur-sm px-3 py-1 rounded-full font-medium border border-emerald-200">
            ✓ 数据完整
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {issues.map((issue) => (
          <div
            key={issue.title}
            className={`relative overflow-hidden ${issue.bgColor}/60 backdrop-blur-sm rounded-xl p-4 border ${
              issue.count > 0 ? 'border-slate-200/60' : 'border-white/60'
            } transition-all hover:shadow-md hover:-translate-y-1 duration-300`}
          >
            {/* 装饰元素 */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full -mr-8 -mt-8"></div>

            <div className="relative flex items-center justify-between mb-2.5">
              <div className={`${issue.bgColor} p-2 rounded-lg`}>
                <issue.icon className={`h-5 w-5 ${issue.color}`} />
              </div>
              <span
                className={`text-3xl font-bold ${
                  issue.count > 0 ? issue.color : 'text-slate-300'
                }`}
              >
                {issue.count}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-800 mb-1">{issue.title}</h4>
            <p className="text-xs text-slate-600">{issue.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
