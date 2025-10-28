/**
 * 标签选择器组件 - 用于歌曲和歌单的标签选择
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

export interface Tag {
  id: number;
  name: string;
  color?: string;
  description?: string;
  songCount?: number;
}

interface TagSelectorProps {
  selectedTagIds?: number[];
  onSelectionChange?: (tagIds: number[]) => void;
  maxSelections?: number;
  disabled?: boolean;
  fetchUrl?: string;
}

export function TagSelector({
  selectedTagIds = [],
  onSelectionChange,
  maxSelections = 10,
  disabled = false,
  fetchUrl = '/api/admin/tags'
}: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(selectedTagIds));

  // 加载标签列表
  const loadTags = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error('加载标签失败');
      }
      const result = await response.json();
      if (result.success) {
        setTags(result.data);
      } else {
        throw new Error(result.message || '加载标签失败');
      }
    } catch (error) {
      console.error('加载标签失败:', error);
      toast.error('加载标签失败');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUrl]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // 同步外部传入的选中状态
  useEffect(() => {
    setSelectedIds(new Set(selectedTagIds));
  }, [selectedTagIds]);

  // 处理标签选择
  const handleToggleTag = (tagId: number) => {
    if (disabled) return;

    const newSelectedIds = new Set(selectedIds);

    if (newSelectedIds.has(tagId)) {
      newSelectedIds.delete(tagId);
    } else {
      if (newSelectedIds.size >= maxSelections) {
        toast.error(`最多只能选择${maxSelections}个标签`);
        return;
      }
      newSelectedIds.add(tagId);
    }

    setSelectedIds(newSelectedIds);
    onSelectionChange?.(Array.from(newSelectedIds));
  };

  // 移除选中的标签
  const handleRemoveTag = (tagId: number) => {
    if (disabled) return;

    const newSelectedIds = new Set(selectedIds);
    newSelectedIds.delete(tagId);
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(Array.from(newSelectedIds));
  };

  // 获取标签颜色
  const getTagColor = (tag: Tag) => {
    return tag.color || '#3B82F6';
  };

  // 获取选中的标签
  const selectedTags = tags.filter(tag => selectedIds.has(tag.id));
  // 获取未选中的标签
  const availableTags = tags.filter(tag => !selectedIds.has(tag.id));

  return (
    <div className="space-y-3">
      <div>
        <Label>标签</Label>
      </div>

      {/* 已选择的标签 */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-slate-600">已选择 ({selectedTags.length}/{maxSelections})</Label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="gap-1 pr-1"
                style={{
                  backgroundColor: `${getTagColor(tag)}20`,
                  borderColor: getTagColor(tag),
                  borderWidth: '1px'
                }}
              >
                <span className="text-xs font-medium" style={{ color: getTagColor(tag) }}>
                  {tag.name}
                </span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    className="ml-1 hover:bg-slate-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 可选择的标签 */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
            ))}
          </div>
        ) : availableTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Button
                key={tag.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleToggleTag(tag.id)}
                disabled={disabled || selectedIds.size >= maxSelections}
                className="h-7 text-xs"
                style={{
                  borderColor: getTagColor(tag),
                  color: getTagColor(tag)
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                {tag.name}
                {tag.songCount !== undefined && (
                  <span className="ml-1 text-xs opacity-60">({tag.songCount})</span>
                )}
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            {selectedTags.length >= maxSelections
              ? `已达到最大选择数量 (${maxSelections}个)`
              : '暂无可用标签'
            }
          </div>
        )}
      </div>
    </div>
  );
}
