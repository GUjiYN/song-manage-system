"use client";

import { useState } from "react";
import { AuthForm, AuthSwitch } from "@/components/domain/auth/auth-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

export function RegisterForm() {
    const { register } = useAuth();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            toast.error("两次输入的密码不一致");
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                email: email.trim(),
                username: username.trim(),
                password,
                name: name.trim() || undefined,
            });
        } catch (error) {
            // 错误提示由上下文统一处理
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthForm
            title="创建新账号"
            description="请输入必要信息完成注册"
            footer={
                <AuthSwitch
                    message="已经有账户？"
                    href="/auth/login"
                    linkLabel="立即登录"
                />
            }
        >
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">邮箱</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="请输入邮箱地址"
                            autoComplete="email"
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">用户名</Label>
                        <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            placeholder="请输入用户名"
                            autoComplete="username"
                            minLength={3}
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">昵称（可选）</Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="设置展示昵称"
                            autoComplete="nickname"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">密码</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="请输入至少 6 位密码"
                            autoComplete="new-password"
                            minLength={6}
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">确认密码</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            placeholder="再次输入密码"
                            autoComplete="new-password"
                            minLength={6}
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                </div>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "注册中..." : "注册"}
                </Button>
            </form>
        </AuthForm>
    );
}
