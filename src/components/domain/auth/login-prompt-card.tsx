/**
 * 登录提示卡片组件
 * 用于未登录用户在侧边栏显示登录提示
 */

"use client";

import { LogIn, UserPlus, Music, ListMusic, Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { memo } from 'react';

export const LoginPromptCard = memo(function LoginPromptCard() {
  return (
    <Card className="mx-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Music className="w-5 h-5 text-indigo-600" />
          管理我的歌单
        </CardTitle>
        <CardDescription className="text-sm">
          登录后即可创建和管理您的个人歌单
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ListMusic className="w-4 h-4" />
            <span>创建无限歌单</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Heart className="w-4 h-4" />
            <span>收藏喜欢的音乐</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link href="/auth/login" className="w-full">
            <Button className="w-full" size="sm">
              <LogIn className="w-4 h-4 mr-2" />
              立即登录
            </Button>
          </Link>

          <Link href="/auth/register" className="w-full">
            <Button variant="outline" className="w-full" size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              注册账号
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});