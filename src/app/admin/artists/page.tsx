/**
 * 歌手管理页面
 */

"use client";

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Music,
  Disc
} from 'lucide-react';
import { getArtists, createArtist, updateArtist, deleteArtist } from '@/services/admin/song';
import { Artist, ArtistFormData, ArtistQueryParams } from '@/types/song';
import { toast } from 'sonner';

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState<ArtistFormData>({
    name: '',
    avatar: '',
    bio: '',
  });

  const limit = 10;

  // 加载歌手列表
  const loadArtists = async (page: number = 1, search: string = '') => {
    try {
      setIsLoading(true);
      setError(null);

      const params: ArtistQueryParams = {
        page,
        limit,
        search: search || undefined
      };

      const response = await getArtists(params);
      setArtists(response.artists || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.page || 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载失败'));
      setArtists([]); // 出错时清空歌手列表
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArtists(currentPage, searchQuery);
  }, []);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadArtists(1, searchQuery);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      avatar: '',
      bio: '',
    });
    setEditingArtist(null);
  };

  // 处理创建歌手
  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createArtist(formData);
      toast.success('歌手创建成功！');
      setIsCreateDialogOpen(false);
      resetForm();
      await loadArtists(currentPage, searchQuery);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建失败';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理编辑歌手
  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist);
    setFormData({
      name: artist.name,
      avatar: artist.avatar || '',
      bio: artist.bio || '',
    });
    setIsEditDialogOpen(true);
  };

  // 处理更新歌手
  const handleUpdateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtist) return;

    setIsSubmitting(true);
    try {
      await updateArtist(editingArtist.id, formData);
      toast.success('歌手更新成功！');
      setIsEditDialogOpen(false);
      resetForm();
      await loadArtists(currentPage, searchQuery);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新失败';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理删除歌手
  const handleDeleteArtist = async (artist: Artist) => {
    if (!window.confirm(`确定要删除歌手"${artist.name}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      await deleteArtist(artist.id);
      toast.success(`歌手"${artist.name}"已删除`);
      await loadArtists(currentPage, searchQuery);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除失败';
      toast.error(errorMessage);
    }
  };

  // 加载状态
  if (isLoading && artists.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">歌手管理</h1>
            <p className="text-slate-500">管理系统中的所有歌手</p>
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 bg-slate-200 rounded animate-pulse"></div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // 错误状态
  if (error && artists.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <User className="w-16 h-16 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-rose-600 mb-2">加载失败</h2>
          <p className="text-slate-500 mb-4">{error.message}</p>
          <Button onClick={() => loadArtists(currentPage, searchQuery)}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">歌手管理</h1>
          <p className="text-slate-500">管理系统中的所有歌手</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加歌手
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>添加新歌手</DialogTitle>
              <DialogDescription>
                填写歌手信息以添加到系统
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateArtist} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">歌手名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入歌手名称"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">头像URL</Label>
                <Input
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="输入头像图片URL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">个人简介</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="输入歌手简介"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '创建中...' : '创建'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索栏 */}
      <form onSubmit={handleSearch}>
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="搜索歌手名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">搜索</Button>
        </div>
      </form>

      {/* 歌手列表 */}
      <Card className="border border-slate-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>歌手名称</TableHead>
              <TableHead>歌曲数量</TableHead>
              <TableHead>专辑数量</TableHead>
              <TableHead>个人简介</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artists.length > 0 ? (
              artists.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      {artist.avatar ? (
                        <img
                          src={artist.avatar}
                          alt={artist.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{artist.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Music className="w-4 h-4 mr-1 text-slate-400" />
                      {artist._count?.songs || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Disc className="w-4 h-4 mr-1 text-slate-400" />
                      {artist._count?.albums || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {artist.bio || '暂无简介'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(artist.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-slate-100 transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                          onClick={() => handleEditArtist(artist)}
                          className="text-slate-600 hover:bg-slate-200/70 hover:text-slate-800 focus:bg-slate-200/70 focus:text-slate-800 cursor-pointer transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteArtist(artist)}
                          className="text-slate-600 hover:bg-slate-200/70 hover:text-slate-800 focus:bg-slate-200/70 focus:text-slate-800 cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 mb-2">
                    {searchQuery ? '没有找到匹配的歌手' : '还没有添加任何歌手'}
                  </h3>
                  <p className="text-slate-500">
                    {searchQuery ? '试试其他关键词' : '点击上方按钮添加第一位歌手'}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadArtists(currentPage - 1, searchQuery)}
            disabled={currentPage <= 1 || isLoading}
          >
            上一页
          </Button>
          <span className="text-sm text-slate-500">
            第 {currentPage} 页，共 {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadArtists(currentPage + 1, searchQuery)}
            disabled={currentPage >= totalPages || isLoading}
          >
            下一页
          </Button>
        </div>
      )}

      {/* 编辑歌手对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑歌手</DialogTitle>
            <DialogDescription>
              修改歌手信息
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateArtist} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">歌手名称 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="输入歌手名称"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-avatar">头像URL</Label>
              <Input
                id="edit-avatar"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="输入头像图片URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bio">个人简介</Label>
              <Textarea
                id="edit-bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="输入歌手简介"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '更新中...' : '更新'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
