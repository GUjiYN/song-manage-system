/**
 * 歌单创建/编辑表单组件
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { PlaylistFormData } from '@/types/playlist';
import { useAuth } from '@/contexts/auth-context';
import { ArrowLeft, Save } from 'lucide-react';

interface PlaylistFormProps {
  initialData?: Partial<PlaylistFormData>;
  onSubmit: (data: PlaylistFormData) => Promise<void>;
  isLoading?: boolean;
  title: string;
  submitText: string;
  onCancel?: () => void;
  showCancel?: boolean;
  inDialog?: boolean; // 是否在弹窗中使用
}

export function PlaylistForm({
  initialData = {},
  onSubmit,
  isLoading = false,
  title,
  submitText,
  onCancel,
  showCancel = true,
  inDialog = false
}: PlaylistFormProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState<PlaylistFormData>({
    name: initialData.name || '',
    description: initialData.description || '',
    coverUrl: initialData.coverUrl || '',
    isPublic: initialData.isPublic ?? true,
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

    if (formData.description && formData.description.length > 500) {
      newErrors.description = '描述不能超过500个字符';
    }

    // 移除封面URL的验证，因为现在支持直接上传和URL输入
    // ImageUpload组件已经包含了相应的验证逻辑

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 简单的URL验证
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
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

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
          {/* 歌单名称 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              歌单名称 <span className="text-red-500">*</span>
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

          {/* 歌单描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">
              歌单描述
              <span className="text-sm text-gray-500 ml-2">（选填）</span>
            </Label>
            <Textarea
              id="description"
              placeholder="介绍一下你的歌单吧，让大家更好地了解～"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isLoading || isSubmitting}
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* 封面图片 */}
          <div className="space-y-2">
            <Label>
              封面图片
              <span className="text-sm text-gray-500 ml-2">（选填）</span>
            </Label>
            <ImageUpload
              value={formData.coverUrl}
              onChange={(url) => handleInputChange('coverUrl', url)}
              placeholder="上传歌单封面"
              maxSize={5}
              disabled={isLoading || isSubmitting}
            />
          </div>

          {/* 公开设置 */}
          <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="isPublic" className="text-base font-medium">
                公开歌单
              </Label>
              <p className="text-sm text-gray-500">
                公开的歌单会显示在发现页面，其他用户可以查看和收藏
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
              disabled={isLoading || isSubmitting}
            />
          </div>

          {/* 操作按钮 */}
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
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
            >
              {(isSubmitting || isLoading) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {submitText}
                </>
              )}
            </Button>
          </div>
        </form>
  );

  // 在弹窗中使用时，直接返回表单内容
  if (inDialog) {
    return formContent;
  }

  // 在页面中使用时，包含完整的页面布局
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* 页面头部 */}
      <div className="flex items-center gap-4 mb-8">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        )}
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>

      {/* 表单卡片 */}
      <Card className="p-6">
        {formContent}
      </Card>
    </div>
  );
}