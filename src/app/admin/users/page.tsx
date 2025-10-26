/**
 * 用户管理页面
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Shield,
  Mail,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type AdminUser,
  type UserRole,
  type UserFormData,
  type UserQueryParams,
} from '@/services/admin/user-service';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    name: '',
    password: '',
    role: 'USER',
    avatar: '',
  });

  const limit = 10;

  // 加载用户列表
  const loadUsers = async (page: number = 1, search: string = '') => {
    try {
      setIsLoading(true);
      setError(null);

      const params: UserQueryParams = {
        page,
        limit,
        search: search || undefined
      };

      const response = await getUsers(params);
      setUsers(response.users || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.page || 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载失败'));
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(currentPage, searchQuery);
  }, []);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers(1, searchQuery);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      name: '',
      password: '',
      role: 'USER',
      avatar: '',
    });
    setEditingUser(null);
  };

  // 处理创建用户
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createUser(formData);
      toast.success('用户创建成功！');
      setIsCreateDialogOpen(false);
      resetForm();
      await loadUsers(currentPage, searchQuery);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建失败';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理编辑用户
  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      name: user.name || '',
      password: '',
      role: user.role,
      avatar: user.avatar || '',
    });
    setIsEditDialogOpen(true);
  };

  // 处理更新用户
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      await updateUser(editingUser.id, formData);
      toast.success('用户更新成功！');
      setIsEditDialogOpen(false);
      resetForm();
      await loadUsers(currentPage, searchQuery);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新失败';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 打开删除确认对话框
  const openDeleteDialog = (user: AdminUser) => {
    setEditingUser(user);
    setIsDeleteDialogOpen(true);
  };

  // 处理删除用户
  const handleDeleteUser = async () => {
    if (!editingUser) return;

    try {
      await deleteUser(editingUser.id);
      toast.success(`用户"${editingUser.username}"已删除`);
      setIsDeleteDialogOpen(false);
      setEditingUser(null);
      await loadUsers(currentPage, searchQuery);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除失败';
      toast.error(errorMessage);
    }
  };

  // 获取角色显示信息
  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      ADMIN: { label: '管理员', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
      MANAGER: { label: '经理', className: 'bg-purple-100 text-purple-700 border-purple-200' },
      USER: { label: '用户', className: 'bg-slate-100 text-slate-700 border-slate-200' },
    };

    const config = roleConfig[role];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // 加载状态
  if (isLoading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">用户管理</h1>
            <p className="text-slate-500">管理系统中的所有用户</p>
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
  if (error && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Users className="w-16 h-16 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-rose-600 mb-2">加载失败</h2>
          <p className="text-slate-500 mb-4">{error.message}</p>
          <Button onClick={() => loadUsers(currentPage, searchQuery)}>
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
          <h1 className="text-2xl font-bold text-slate-800">用户管理</h1>
          <p className="text-slate-500">管理系统中的所有用户</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加用户
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>添加新用户</DialogTitle>
              <DialogDescription>
                填写用户信息以添加到系统
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名 *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="输入用户名"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="输入邮箱地址"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入真实姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码 *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="输入密码"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">角色 *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">用户</SelectItem>
                    <SelectItem value="MANAGER">经理</SelectItem>
                    <SelectItem value="ADMIN">管理员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">头像URL</Label>
                <Input
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="输入头像URL"
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
              placeholder="搜索用户名、邮箱..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">搜索</Button>
        </div>
      </form>

      {/* 用户列表 */}
      <Card className="border border-slate-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 backdrop-blur">
              <TableHead className="pl-6 py-3">用户</TableHead>
              <TableHead className="py-3">角色</TableHead>
              <TableHead className="py-3">邮箱</TableHead>
              <TableHead className="py-3">创建时间</TableHead>
              <TableHead className="text-right pr-6 py-3">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="group transition-colors hover:bg-slate-50/70 focus-within:bg-slate-50/70"
                >
                  <TableCell className="font-medium pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar ?? undefined} alt={user.name || user.username} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700">
                          {(user.name || user.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {user.name || user.username}
                        </div>
                        <div className="text-sm text-slate-500">@{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-slate-600">
                      <Mail className="w-4 h-4 mr-2 text-slate-400" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-slate-600">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
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
                          onClick={() => handleEditUser(user)}
                          className="text-slate-600 hover:bg-slate-200/70 hover:text-slate-800 focus:bg-slate-200/70 focus:text-slate-800 cursor-pointer transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                      <DropdownMenuItem
                          onClick={() => openDeleteDialog(user)}
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
                <TableCell colSpan={5} className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 mb-2">
                    {searchQuery ? '没有找到匹配的用户' : '还没有添加任何用户'}
                  </h3>
                  <p className="text-slate-500">
                    {searchQuery ? '试试其他关键词' : '点击上方按钮添加第一个用户'}
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
            onClick={() => loadUsers(currentPage - 1, searchQuery)}
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
            onClick={() => loadUsers(currentPage + 1, searchQuery)}
            disabled={currentPage >= totalPages || isLoading}
          >
            下一页
          </Button>
        </div>
      )}

      {/* 编辑用户对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>
              修改用户信息
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">用户名 *</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="输入用户名"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">邮箱 *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="输入邮箱地址"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">姓名</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="输入真实姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">密码（留空不修改）</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="输入新密码"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">角色 *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">用户</SelectItem>
                  <SelectItem value="MANAGER">经理</SelectItem>
                  <SelectItem value="ADMIN">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-avatar">头像URL</Label>
              <Input
                id="edit-avatar"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="输入头像URL"
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

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-600">
              确定要删除用户 "{editingUser?.username}" 吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={() => handleDeleteUser()} className="bg-red-600 hover:bg-red-700">
                删除
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}