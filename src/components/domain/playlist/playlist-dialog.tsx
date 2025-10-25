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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">创建歌单</DialogTitle>
        </DialogHeader>

        <SimplePlaylistForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}

// 简化的歌单创建表单组件（用于弹窗）
interface SimplePlaylistFormProps {
  onSubmit: (data: PlaylistFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel: () => void;
}

function SimplePlaylistForm({ onSubmit, isLoading = false, onCancel }: SimplePlaylistFormProps) {
  const [formData, setFormData] = useState<PlaylistFormData>({
    name: '',
    description: '',
    coverUrl: '',
    isPublic: true, // 默认为公开歌单
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '歌单名称不能为空';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = '歌单名称不能超过100个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // 错误已经在调用方处理
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (
    field: keyof PlaylistFormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 歌单名称 */}
      <div className="space-y-2">
        <Label htmlFor="name">
          歌单标题 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="给你的歌单起个名字吧～"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          disabled={isLoading || isSubmitting}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* 隐私设置 */}
      <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-lg">
        <div className="space-y-1">
          <Label htmlFor="isPublic" className="text-base font-medium">
            隐私歌单
          </Label>
          <p className="text-sm text-gray-500">
            隐私歌单不能被别人发现
          </p>
        </div>
        <Switch
          id="isPublic"
          checked={!formData.isPublic} // 注意：isPublic为false时表示隐私歌单
          onCheckedChange={(checked) => handleInputChange('isPublic', !checked)}
          disabled={isLoading || isSubmitting}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          取消
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="flex-1"
        >
          {(isSubmitting || isLoading) ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              创建中...
            </>
          ) : (
            '创建'
          )}
        </Button>
      </div>
    </form>
  );
}