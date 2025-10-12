"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { register } from "@/services/client/auth";
import type { RegisterFormData } from "@/types/auth";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<RegisterFormData>({
        email: "",
        username: "",
        password: "",
        name: "",
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 基础验证
        if (!formData.email || !formData.username || !formData.password) {
            toast.error("请填写完整的注册信息");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("密码长度至少为 6 位");
            return;
        }

        if (formData.password !== confirmPassword) {
            toast.error("两次输入的密码不一致");
            return;
        }

        if (formData.username.length < 3) {
            toast.error("用户名长度至少为 3 位");
            return;
        }

        setIsLoading(true);

        try {
            // 过滤掉空字符串的 name
            const submitData = {
                ...formData,
                name: formData.name || undefined,
            };

            const user = await register(submitData);
            toast.success(`注册成功，欢迎 ${user.name || user.username}！`);

            // 注册成功后跳转到主页
            router.push("/");
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("注册失败，请稍后重试");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>用户注册</CardTitle>
                    <CardDescription>
                        创建您的账号开始使用
                    </CardDescription>
                    <CardAction>
                        <Button
                            variant="link"
                            onClick={() => router.push("/main")}
                        >
                            已有账号？立即登录
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">邮箱</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="输入邮箱"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="username">用户名</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="输入用户名（至少3位）"
                                    value={formData.username}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            username: e.target.value,
                                        })
                                    }
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">昵称（可选）</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="输入昵称"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">密码</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="输入密码（至少6位）"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">确认密码</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="再���输入密码"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full mt-6"
                            disabled={isLoading}
                        >
                            {isLoading ? "注册中..." : "注册"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button
                        variant="outline"
                        className="w-full"
                        disabled={isLoading}
                    >
                        使用 Google 注册
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
