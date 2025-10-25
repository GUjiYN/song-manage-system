/**
 * 歌单编辑弹窗组件
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PlaylistFormData, Playlist } from '@/types/playlist';
import { updatePlaylist } from '@/services/client/playlist';
import { toast } from 'sonner';

interface PlaylistEditDialogProps {
  playlist: Playlist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedPlaylist: Playlist) => void;
}

export function PlaylistEditDialog({
  playlist,
  open,
  onOpenChange,
  onSuccess
}: PlaylistEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PlaylistFormData>({
    name: playlist.name,
    description: playlist.description || '',
    coverUrl: playlist.coverUrl || '',
    isPublic: playlist.isPublic,
    tags: playlist.tags || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '歌单名称不能为空';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = '歌单名称不能超过100个字符';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = '描述不能超过500个字符';
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

    setIsLoading(true);
    try {
      const updatedPlaylist = await updatePlaylist(playlist.id, formData);
      toast.success('歌单信息更新成功');
      onSuccess(updatedPlaylist);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新失败';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (
    field: keyof PlaylistFormData,
    value: string | boolean | string[]
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

  // 处理弹窗关闭
  const handleOpenChange = (isOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">编辑歌单</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 歌单标题 */}
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
              disabled={isLoading}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* 歌单简介 */}
          <div className="space-y-2">
            <Label htmlFor="description">
              歌单简介
              <span className="text-sm text-gray-500 ml-2">（选填）</span>
            </Label>
            <Textarea
              id="description"
              placeholder="介绍一下你的歌单吧，让大家更好地了解～"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isLoading}
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label htmlFor="tags">
              标签
              <span className="text-sm text-gray-500 ml-2">（选填，用空格分隔）</span>
            </Label>
            <Input
              id="tags"
              type="text"
              placeholder="如：流行 摇滚 电子"
              value={formData.tags?.join(' ') || ''}
              onChange={(e) => {
                const tags = e.target.value
                  .split(' ')
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0);
                handleInputChange('tags', tags);
              }}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500">
              用空格分隔多个标签，最多5个标签
            </p>
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
              checked={!formData.isPublic}
              onCheckedChange={(checked) => handleInputChange('isPublic', !checked)}
              disabled={isLoading}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}