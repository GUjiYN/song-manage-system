/**
 * 歌曲管理页面
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
import {
  Music,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Clock,
  Play
} from 'lucide-react';
import { getSongs, createSong, updateSong, deleteSong } from '@/services/admin/song';
import { Song, SongFormData, SongQueryParams } from '@/types/song';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState<SongFormData>({
    title: '',
    duration: '',
    coverUrl: '',
    fileUrl: '',
    albumId: 0,
    artistId: 0,
  });

  const limit = 10;

  // 加载歌曲列表
  const loadSongs = async (page: number = 1, search: string = '') => {
    try {
      setIsLoading(true);
      setError(null);

      const params: SongQueryParams = {
        page,
        limit,
        search: search || undefined
      };

      const response = await getSongs(params);
      setSongs(response.songs || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.page || 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载失败'));
      setSongs([]); // 出错时清空歌曲列表
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSongs(currentPage, searchQuery);
  }, []);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadSongs(1, searchQuery);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      duration: '',
      coverUrl: '',
      fileUrl: '',
      albumId: 0,
      artistId: 0,
    });
    setEditingSong(null);
  };

  // 处理创建歌曲
  const handleCreateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createSong(formData);
      toast.success('歌曲创建成功！');
      setIsCreateDialogOpen(false);
      resetForm();
      await loadSongs(currentPage, searchQuery);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建失败';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理编辑歌曲
  const handleEditSong = (song: Song) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      duration: song.duration ?? '',
      coverUrl: song.coverUrl || '',
      fileUrl: song.fileUrl || '',
      albumId: song.albumId,
      artistId: song.artistId,
    });
    setIsEditDialogOpen(true);
  };

  // 处理更新歌曲
  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;

    setIsSubmitting(true);
    try {
      await updateSong(editingSong.id, formData);
      toast.success('歌曲更新成功！');
      setIsEditDialogOpen(false);
      resetForm();
      await loadSongs(currentPage, searchQuery);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新失败';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理删除歌曲
  const handleDeleteSong = async (song: Song) => {
    if (!window.confirm(`确定要删除歌曲"${song.title}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      await deleteSong(song.id);
      toast.success(`歌曲"${song.title}"已删除`);
      await loadSongs(currentPage, searchQuery);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除失败';
      toast.error(errorMessage);
    }
  };

  // 格式化时长
  const formatSeconds = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const parseDurationToSeconds = (value?: string | null) => {
    if (!value) {
      return 0;
    }

    const trimmed = value.trim();
    const match = trimmed.match(/^(\d{1,2}):([0-5]\d)$/);
    if (match) {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      return minutes * 60 + seconds;
    }

    const numeric = Number(trimmed);
    if (Number.isFinite(numeric) && numeric >= 0) {
      return Math.floor(numeric);
    }

    return 0;
  };

  const formatDuration = (value?: string | null) => {
    if (!value) {
      return '--:--';
    }

    const trimmed = value.trim();
    if (/^\d{1,2}:[0-5]\d$/.test(trimmed)) {
      return trimmed;
    }

    const seconds = parseDurationToSeconds(trimmed);
    if (seconds === 0) {
      return trimmed;
    }

    return formatSeconds(seconds);
  };

  // 加载状态
  if (isLoading && songs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">歌曲管理</h1>
            <p className="text-slate-500">管理系统中的所有歌曲</p>
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
  if (error && songs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Music className="w-16 h-16 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-rose-600 mb-2">加载失败</h2>
          <p className="text-slate-500 mb-4">{error.message}</p>
          <Button onClick={() => loadSongs(currentPage, searchQuery)}>
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
          <h1 className="text-2xl font-bold text-slate-800">歌曲管理</h1>
          <p className="text-slate-500">管理系统中的所有歌曲</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加歌曲
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>添加新歌曲</DialogTitle>
              <DialogDescription>
                填写歌曲信息以添加到系统
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSong} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">歌曲名称 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="输入歌曲名称"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">时长（MM:SS） *</Label>
                <Input
                  id="duration"
                  value={formData.duration ?? ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="例如 03:45"
                  pattern="^\\d{1,2}:[0-5]\\d$"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artistId">歌手ID *</Label>
                <Input
                  id="artistId"
                  type="number"
                  value={formData.artistId}
                  onChange={(e) => setFormData({ ...formData, artistId: parseInt(e.target.value) || 0 })}
                  placeholder="输入歌手ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="albumId">专辑ID *</Label>
                <Input
                  id="albumId"
                  type="number"
                  value={formData.albumId}
                  onChange={(e) => setFormData({ ...formData, albumId: parseInt(e.target.value) || 0 })}
                  placeholder="输入专辑ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverUrl">封面URL</Label>
                <Input
                  id="coverUrl"
                  value={formData.coverUrl}
                  onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                  placeholder="输入封面图片URL"
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
              placeholder="搜索歌曲名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">搜索</Button>
        </div>
      </form>

      {/* 歌曲列表 */}
      <Card className="border border-slate-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 backdrop-blur">
              <TableHead className="w-[320px]">歌曲</TableHead>
              <TableHead>歌手</TableHead>
              <TableHead>专辑</TableHead>
              <TableHead>时长</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.length > 0 ? (
              songs.map((song) => (
                <TableRow
                  key={song.id}
                  className="group transition-colors hover:bg-slate-50/70 focus-within:bg-slate-50/70"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-4">
                      {song.coverUrl ? (
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          className="w-12 h-12 rounded-lg object-cover shadow-sm ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 ring-1 ring-slate-200">
                          <Music className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 group-hover:text-slate-800">
                            {song.title}
                          </span>
                          <Badge
                            variant="secondary"
                            className="hidden sm:inline-flex bg-slate-100 text-slate-600 border-slate-200"
                          >
                            #{song.id}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Badge
                            variant="outline"
                            className="border-slate-200 bg-slate-50 text-slate-600"
                          >
                            {song.artist?.name || `歌手ID ${song.artistId}`}
                          </Badge>
                          {song.album?.name && (
                            <Badge
                              variant="outline"
                              className="border-slate-200 bg-slate-50 text-slate-600"
                            >
                              {song.album.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-8 w-8 shrink-0 rounded-full text-slate-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:text-slate-900 pointer-events-none group-hover:pointer-events-auto"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {song.artist?.name || `ID: ${song.artistId}`}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {song.album?.name || `ID: ${song.albumId}`}
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      <Clock className="mr-1 h-3.5 w-3.5 text-slate-400" />
                      {formatDuration(song.duration)}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {new Date(song.createdAt).toLocaleDateString()}
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
                          onClick={() => handleEditSong(song)}
                          className="text-slate-600 hover:bg-slate-200/70 hover:text-slate-800 focus:bg-slate-200/70 focus:text-slate-800 cursor-pointer transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteSong(song)}
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
                  <Music className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 mb-2">
                    {searchQuery ? '没有找到匹配的歌曲' : '还没有添加任何歌曲'}
                  </h3>
                  <p className="text-slate-500">
                    {searchQuery ? '试试其他关键词' : '点击上方按钮添加第一首歌曲'}
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
            onClick={() => loadSongs(currentPage - 1, searchQuery)}
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
            onClick={() => loadSongs(currentPage + 1, searchQuery)}
            disabled={currentPage >= totalPages || isLoading}
          >
            下一页
          </Button>
        </div>
      )}

      {/* 编辑歌曲对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑歌曲</DialogTitle>
            <DialogDescription>
              修改歌曲信息
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSong} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">歌曲名称 *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="输入歌曲名称"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">时长（MM:SS） *</Label>
              <Input
                id="edit-duration"
                value={formData.duration ?? ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="例如 03:45"
                pattern="^\\d{1,2}:[0-5]\\d$"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-artistId">歌手ID *</Label>
              <Input
                id="edit-artistId"
                type="number"
                value={formData.artistId}
                onChange={(e) => setFormData({ ...formData, artistId: parseInt(e.target.value) || 0 })}
                placeholder="输入歌手ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-albumId">专辑ID *</Label>
              <Input
                id="edit-albumId"
                type="number"
                value={formData.albumId}
                onChange={(e) => setFormData({ ...formData, albumId: parseInt(e.target.value) || 0 })}
                placeholder="输入专辑ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-coverUrl">封面URL</Label>
              <Input
                id="edit-coverUrl"
                value={formData.coverUrl}
                onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                placeholder="输入封面图片URL"
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
