/**
 * 歌单卡片骨架屏组件
 */

import { Card } from '@/components/ui/card';

interface PlaylistSkeletonProps {
  className?: string;
}

export function PlaylistSkeleton({ className = '' }: PlaylistSkeletonProps) {
  return (
    <div className={className}>
      {/* 封面图骨架 - 正方形 */}
      <div className="relative aspect-square bg-slate-200 rounded-lg animate-pulse shadow-md" />

      {/* 歌单信息骨架 - 显示在封面下方 */}
      <div className="mt-3 space-y-2">
        {/* 标题骨架 */}
        <div className="h-5 bg-slate-200 rounded animate-pulse w-full" />
        <div className="h-5 bg-slate-200 rounded animate-pulse w-3/4" />

        {/* 元信息骨架 */}
        <div className="h-3 bg-slate-200 rounded animate-pulse w-32" />
      </div>
    </div>
  );
}

interface PlaylistGridSkeletonProps {
  count?: number;
  className?: string;
}

export function PlaylistGridSkeleton({ count = 12, className = '' }: PlaylistGridSkeletonProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <PlaylistSkeleton key={index} />
      ))}
    </div>
  );
}