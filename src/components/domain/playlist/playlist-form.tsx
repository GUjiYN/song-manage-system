/**
 * Shared playlist create/edit form.
 */

"use client";

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { TagSelector } from '@/components/admin/tag-selector';
import { PlaylistFormData } from '@/types/playlist';
import { ArrowLeft, Save } from 'lucide-react';

interface PlaylistFormProps {
  initialData?: Partial<PlaylistFormData> & {
    // legacy support when callers provide tag objects instead of ids
    tags?: { id: number }[];
  };
  onSubmit: (data: PlaylistFormData) => Promise<void>;
  isLoading?: boolean;
  title: string;
  submitText: string;
  onCancel?: () => void;
  showCancel?: boolean;
  inDialog?: boolean;
}

export function PlaylistForm({
  initialData = {},
  onSubmit,
  isLoading = false,
  title,
  submitText,
  onCancel,
  showCancel = true,
  inDialog = false,
}: PlaylistFormProps) {
  const initialTagIds = useMemo(() => {
    if (Array.isArray(initialData.tagIds)) {
      return initialData.tagIds;
    }
    if (Array.isArray(initialData.tags)) {
      return initialData.tags.map((tag) => tag.id);
    }
    return [];
  }, [initialData.tagIds, initialData.tags]);

  const [formData, setFormData] = useState<PlaylistFormData>({
    name: initialData.name ?? '',
    description: initialData.description ?? '',
    coverUrl: initialData.coverUrl ?? '',
    isPublic: initialData.isPublic ?? true,
    tagIds: initialTagIds,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="playlist-name">
          歌单名称 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="playlist-name"
          type="text"
          placeholder="给歌单取一个闪亮的名字吧～"
          value={formData.name}
          onChange={(event) => handleInputChange('name', event.target.value)}
          disabled={isLoading || isSubmitting}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="playlist-description">
          歌单描述 <span className="text-xs text-gray-500">（选填）</span>
        </Label>
        <Textarea
          id="playlist-description"
          placeholder="介绍一下歌单的灵感或者风格吧～"
          value={formData.description}
          onChange={(event) =>
            handleInputChange('description', event.target.value)
          }
          disabled={isLoading || isSubmitting}
          rows={4}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>封面图片</Label>
        <ImageUpload
          value={formData.coverUrl}
          onChange={(url) => handleInputChange('coverUrl', url)}
          placeholder="上传歌单封面"
          disabled={isLoading || isSubmitting}
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
          disabled={isLoading || isSubmitting}
          fetchUrl="/api/tags"
        />
        <p className="text-xs text-gray-500">
          最多选择 10 个标签，帮助其他用户快速了解歌单风格
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-4">
        <div className="space-y-1">
          <Label htmlFor="playlist-public" className="text-base font-medium">
            公开歌单
          </Label>
          <p className="text-sm text-gray-500">
            开启后歌单会展示给所有用户，关闭则仅自己可见
          </p>
        </div>
        <Switch
          id="playlist-public"
          checked={formData.isPublic}
          onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
          disabled={isLoading || isSubmitting}
        />
      </div>

      <div className="flex gap-3 pt-4">
        {showCancel && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
        )}
        <Button type="submit" disabled={isLoading || isSubmitting}>
          {isSubmitting || isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              保存中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {submitText}
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (inDialog) {
    return formContent;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
        )}
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>

      <Card className="p-6">{formContent}</Card>
    </div>
  );
}
