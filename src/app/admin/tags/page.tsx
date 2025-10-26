/**
 * 标签管理页面
 */

"use client";

import { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TagItem {
  id: number;
  name: string;
  color: string;
  description?: string;
  songCount: number;
  createdAt: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    description: ''
  });

  // 预设颜色选项
  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#6366F1'
  ];

  // 加载标签数据
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      const result = await response.json();
      if (result.success) {
        setTags(result.data);
      } else {
        throw new Error(result.error || 'Failed to load tags');
      }
    } catch (error) {
      console.error('加载标签失败:', error);
      // 可以在这里添加错误处理，比如显示toast消息
    } finally {
      setIsLoading(false);
    }
  };

  // 过滤标签
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 创建标签
  const handleCreateTag = async () => {
    if (!formData.name.trim()) {
      // 可以在这里添加错误提示
      return;
    }

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tag');
      }

      const result = await response.json();
      if (result.success) {
        setTags([...tags, result.data]);
        setFormData({ name: '', color: '#3B82F6', description: '' });
        setIsCreateDialogOpen(false);
      } else {
        throw new Error(result.error || 'Failed to create tag');
      }
    } catch (error) {
      console.error('创建标签失败:', error);
      // 可以在这里添加错误提示，比如toast消息
    }
  };

  // 更新标签
  const handleUpdateTag = async () => {
    if (!selectedTag || !formData.name.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/tags/${selectedTag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tag');
      }

      const result = await response.json();
      if (result.success) {
        setTags(tags.map(tag =>
          tag.id === selectedTag.id
            ? result.data
            : tag
        ));
        setIsEditDialogOpen(false);
        setSelectedTag(null);
        setFormData({ name: '', color: '#3B82F6', description: '' });
      } else {
        throw new Error(result.error || 'Failed to update tag');
      }
    } catch (error) {
      console.error('更新标签失败:', error);
      // 可以在这里添加错误提示，比如toast消息
    }
  };

  // 删除标签
  const handleDeleteTag = async () => {
    if (!selectedTag) return;

    try {
      const response = await fetch(`/api/tags/${selectedTag.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tag');
      }

      const result = await response.json();
      if (result.success) {
        setTags(tags.filter(tag => tag.id !== selectedTag.id));
        setIsDeleteDialogOpen(false);
        setSelectedTag(null);
      } else {
        throw new Error(result.error || 'Failed to delete tag');
      }
    } catch (error) {
      console.error('删除标签失败:', error);
      // 可以在这里添加错误提示，比如toast消息
    }
  };

  // 打开编辑对话框
  const openEditDialog = (tag: TagItem) => {
    setSelectedTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
      description: tag.description || ''
    });
    setIsEditDialogOpen(true);
  };

  // 打开删除确认对话框
  const openDeleteDialog = (tag: TagItem) => {
    setSelectedTag(tag);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">标签管理</h1>
          <p className="text-slate-500 mt-1">管理音乐标签分类</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              创建标签
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>创建新标签</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">标签名称</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入标签名称"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">标签颜色</label>
                <div className="flex items-center gap-2 mt-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-slate-800' : 'border-slate-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">描述（可选）</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="输入标签描述"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateTag}>
                  创建
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索栏 */}
      <form onSubmit={(e) => { e.preventDefault(); }}>
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="搜索标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">搜索</Button>
        </div>
      </form>

      {/* 标签列表 */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 backdrop-blur">
              <TableHead className="pl-8 py-3">标签</TableHead>
              <TableHead className="py-3">描述</TableHead>
              <TableHead className="py-3">歌曲数量</TableHead>
              <TableHead className="py-3">创建时间</TableHead>
              <TableHead className="text-right pr-8 py-3">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTags.map((tag) => (
              <TableRow
                key={tag.id}
                className="group border border-transparent transition-all hover:border-sky-100 hover:bg-slate-50 hover:shadow-sm focus-within:border-sky-100 focus-within:bg-slate-50"
              >
                <TableCell className="pl-8">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium text-slate-900 group-hover:text-slate-800">{tag.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-slate-600">{tag.description || '-'}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                    {tag.songCount} 首歌曲
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-slate-600">{tag.createdAt}</span>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(tag)}
                      className="hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(tag)}
                      className="text-slate-600 hover:bg-slate-100 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredTags.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {searchTerm ? '未找到匹配的标签' : '暂无标签'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? '尝试调整搜索关键词' : '创建第一个标签开始管理音乐分类'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建标签
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 编辑标签对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑标签</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">标签名称</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="输入标签名称"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">标签颜色</label>
              <div className="flex items-center gap-2 mt-1">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-slate-800' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">描述（可选）</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="输入标签描述"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleUpdateTag}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-600">
              确定要删除标签 "{selectedTag?.name}" 吗？此操作不可撤销。
              {selectedTag && selectedTag.songCount > 0 && (
                <span className="text-amber-600 font-medium mt-2 block">
                  注意：该标签下有 {selectedTag.songCount} 首歌曲，删除标签后这些歌曲将失去此分类。
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleDeleteTag} className="bg-red-600 hover:bg-red-700">
                删除
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}