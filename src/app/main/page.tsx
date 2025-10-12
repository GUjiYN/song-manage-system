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
import { login } from "@/services/client/auth";
import type { LoginFormData } from "@/types/auth";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<LoginFormData>({
        identifier: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 基础验证
        if (!formData.identifier || !formData.password) {
            toast.error("请填写完整的登录信息");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("密码长度至少为 6 位");
            return;
        }

        setIsLoading(true);

        try {
            const user = await login(formData);
            toast.success(`欢迎回来，${user.name || user.username}！`);

            // 登录成功后跳转到主页
            router.push("/");
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("登录失败，请稍后重试");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>用户登录</CardTitle>
                    <CardDescription>
                        输入您的用户名或邮箱登录账号
                    </CardDescription>
                    <CardAction>
                        <Button
                            variant="link"
                            onClick={() => router.push("/register")}
                        >
                            立即注册
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="identifier">用户名或邮箱</Label>
                                <Input
                                    id="identifier"
                                    type="text"
                                    placeholder="输入用户名或邮箱"
                                    value={formData.identifier}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            identifier: e.target.value,
                                        })
                                    }
                                    autoComplete="off"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">密码</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        忘记密码？
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="输入密码"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    autoComplete="off"
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
                            {isLoading ? "登录中..." : "登录"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
