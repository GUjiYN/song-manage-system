/**
 * Playlist edit dialog component.
 */

"use client";

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
import { ImageUpload } from '@/components/ui/image-upload';
import { TagSelector } from '@/components/admin/tag-selector';
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
  onSuccess,
}: PlaylistEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PlaylistFormData>({
    name: playlist.name,
    description: playlist.description ?? '',
    coverUrl: playlist.coverUrl ?? '',
    isPublic: playlist.isPublic,
    tagIds: playlist.tags?.map((tag) => tag.id) ?? [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      nextErrors.name = '歌单名称不能为空';
    } else if (formData.name.trim().length > 100) {
      nextErrors.name = '歌单名称不能超过 100 个字符';
    }

    if (formData.description && formData.description.length > 500) {
      nextErrors.description = '描述不能超过 500 个字符';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof PlaylistFormData,
    value: string | boolean | number[] | undefined,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updatePlaylist(playlist.id, formData);
      toast.success('歌单信息更新成功');
      onSuccess(updated);
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新失败';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogChange = (nextOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(nextOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">编辑歌单</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playlist-name">
              歌单标题 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="playlist-name"
              type="text"
              placeholder="给你的歌单起个名字吧～"
              value={formData.name}
              onChange={(event) => handleInputChange('name', event.target.value)}
              disabled={isSubmitting}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="playlist-description">
              歌单简介 <span className="text-xs text-gray-500">（选填）</span>
            </Label>
            <Textarea
              id="playlist-description"
              placeholder="介绍一下歌单，让更多小伙伴发现它～"
              value={formData.description}
              onChange={(event) =>
                handleInputChange('description', event.target.value)
              }
              disabled={isSubmitting}
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>歌单封面</Label>
            <ImageUpload
              value={formData.coverUrl}
              onChange={(url) => handleInputChange('coverUrl', url)}
              placeholder="上传一张超赞的封面吧"
              disabled={isSubmitting}
              maxSize={5}
            />
            <p className="text-xs text-gray-500">
              支持 JPG、PNG、WebP、GIF，大小不超过 5MB
            </p>
          </div>

          <div className="space-y-2">
            <Label>标签</Label>
            <TagSelector
              selectedTagIds={formData.tagIds ?? []}
              onSelectionChange={(ids) => handleInputChange('tagIds', ids)}
              disabled={isSubmitting}
              fetchUrl="/api/tags"
            />
            <p className="text-xs text-gray-500">
              最多选择 10 个标签，帮助其他用户快速了解歌单风格
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="playlist-private" className="text-base font-medium">
                私密歌单
              </Label>
              <p className="text-sm text-gray-500">
                仅自己可见时请选择私密；关闭则公开给所有用户
              </p>
            </div>
            <Switch
              id="playlist-private"
              checked={!formData.isPublic}
              onCheckedChange={(checked) => handleInputChange('isPublic', !checked)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
