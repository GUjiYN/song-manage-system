"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthForm, AuthSwitch } from "@/components/domain/auth/auth-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

export function LoginForm() {
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const callbackUrl = useMemo(() => {
        const raw = searchParams?.get("callbackUrl") ?? "";
        return raw.startsWith("/") ? raw : null;
    }, [searchParams]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!identifier.trim() || !password.trim()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await login(
                { identifier: identifier.trim(), password },
                callbackUrl ? { redirectTo: callbackUrl } : undefined
            );
        } catch (error) {
            // 错误提示由上下文处理
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthForm
            title="欢迎回来"
            description="使用您的账户信息登录系统"
            footer={
                <AuthSwitch
                    message="还没有账户？"
                    href="/auth/register"
                    linkLabel="立即注册"
                />
            }
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="identifier">用户名或邮箱</Label>
                        <Input
                            id="identifier"
                            type="text"
                            value={identifier}
                            onChange={(event) =>
                                setIdentifier(event.target.value)
                            }
                            placeholder="请输入用户名或邮箱"
                            autoComplete="username"
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">密码</Label>
                            <button
                                type="button"
                                className="text-xs text-slate-500 underline-offset-4 transition hover:text-sky-500 hover:underline"
                            >
                                忘记密码？
                            </button>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="请输入登录密码"
                            autoComplete="current-password"
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
                    {isSubmitting ? "登录中..." : "登录"}
                </Button>
            </form>
        </AuthForm>
    );
}
