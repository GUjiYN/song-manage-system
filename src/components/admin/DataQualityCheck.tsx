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
    <Card className="p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
          数据质量检查
        </h3>
        {totalIssues > 0 ? (
          <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            发现 {totalIssues} 个问题
          </span>
        ) : (
          <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            ✓ 数据完整
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {issues.map((issue) => (
          <div
            key={issue.title}
            className={`${issue.bgColor} rounded-lg p-4 border ${
              issue.count > 0 ? 'border-slate-200' : 'border-transparent'
            } transition-all hover:shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <issue.icon className={`h-5 w-5 ${issue.color}`} />
              <span
                className={`text-2xl font-bold ${
                  issue.count > 0 ? issue.color : 'text-slate-300'
                }`}
              >
                {issue.count}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-800 mb-1">{issue.title}</h4>
            <p className="text-xs text-slate-500">{issue.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
