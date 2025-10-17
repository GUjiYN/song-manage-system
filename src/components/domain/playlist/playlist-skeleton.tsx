/**
 * 歌单卡片骨架屏组件
 */

import { Card } from '@/components/ui/card';

interface PlaylistSkeletonProps {
  className?: string;
}

export function PlaylistSkeleton({ className = '' }: PlaylistSkeletonProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* 封面图骨架 */}
      <div className="relative aspect-square bg-gray-200 animate-pulse" />

      {/* 歌单信息骨架 */}
      <div className="p-4">
        {/* 标题骨架 */}
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />

        {/* 描述骨架 */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>

        {/* 元信息骨架 */}
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
          <div className="flex items-center gap-3">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
          </div>
        </div>

        {/* 时间骨架 */}
        <div className="h-3 bg-gray-200 rounded animate-pulse w-24 mt-2" />
      </div>
    </Card>
  );
}

interface PlaylistGridSkeletonProps {
  count?: number;
  className?: string;
}

export function PlaylistGridSkeleton({ count = 8, className = '' }: PlaylistGridSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <PlaylistSkeleton key={index} />
      ))}
    </div>
  );
}