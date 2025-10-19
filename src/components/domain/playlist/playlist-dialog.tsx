/**
 * 歌单创建弹窗组件
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlaylistForm } from './playlist-form';
import { createPlaylist } from '@/services/client/playlist';
import { PlaylistFormData } from '@/types/playlist';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface PlaylistDialogProps {
  children?: React.ReactNode;
  onCreateSuccess?: (playlist: any) => void;
}

export function PlaylistDialog({ children, onCreateSuccess }: PlaylistDialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 检查用户是否已登录
  if (!user) {
    return (
      <Button
        onClick={() => router.push('/auth/login')}
        className="shrink-0"
      >
        <Plus className="w-4 h-4 mr-2" />
        创建歌单
      </Button>
    );
  }

  // 处理表单提交
  const handleSubmit = async (data: PlaylistFormData) => {
    setIsLoading(true);
    try {
      const newPlaylist = await createPlaylist(data);
      toast.success(`歌单"${newPlaylist.name}"创建成功！`);

      // 关闭弹窗
      setOpen(false);

      // 调用成功回调（会自动刷新歌单列表）
      onCreateSuccess?.(newPlaylist);

      // 不再自动跳转，保持在当前页面
      // router.push(`/playlists/${newPlaylist.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建失败';
      toast.error(errorMessage);
      throw error; // 让表单组件显示错误状态
    } finally {
      setIsLoading(false);
    }
  };

  // 取消操作
  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            创建歌单
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            创建新歌单
          </DialogTitle>
        </DialogHeader>

        <PlaylistForm
          title="创建新歌单"
          submitText="创建歌单"
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={handleCancel}
          showCancel={true}
          inDialog={true}
        />
      </DialogContent>
    </Dialog>
  );
}