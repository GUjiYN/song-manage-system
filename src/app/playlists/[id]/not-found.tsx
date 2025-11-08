/**
 * 歌单详情页面的404页面
 */

"use client";

import { Button } from '@/components/ui/button';
import { Music, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center py-16 max-w-md mx-auto px-4">
        <Music className="w-20 h-20 text-slate-300 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">歌单未找到</h1>
        <p className="text-slate-600 mb-8">
          抱歉，您访问的歌单不存在或已被删除。
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/discover">
            <Button className="w-full">
              <Music className="w-4 h-4 mr-2" />
              发现更多歌单
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上一页
          </Button>
        </div>
      </div>
    </div>
  );
}