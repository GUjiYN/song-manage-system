"use client";

import { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as authService from "@/services/client/auth";
import type { User, LoginFormData, RegisterFormData } from "@/types/auth";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginFormData) => Promise<void>;
    register: (data: RegisterFormData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // 刷新用户信息
    const refreshUser = useCallback(async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            // 如果获取失败（比如 token 过期），清除用户状态
            setUser(null);
        }
    }, []);

    // 初始化时获取用户信息
    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);
            await refreshUser();
            setIsLoading(false);
        };

        initAuth();
    }, [refreshUser]);

    // 登录
    const login = useCallback(
        async (data: LoginFormData) => {
            try {
                const userData = await authService.login(data);
                setUser(userData);
                toast.success(`欢迎回来，${userData.name || userData.username}！`);
                router.push("/");
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(error.message);
                } else {
                    toast.error("登录失败");
                }
                throw error;
            }
        },
        [router]
    );

    // 注册
    const register = useCallback(
        async (data: RegisterFormData) => {
            try {
                const userData = await authService.register(data);
                setUser(userData);
                toast.success(`注册成功，欢迎 ${userData.name || userData.username}！`);
                router.push("/");
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(error.message);
                } else {
                    toast.error("注册失败");
                }
                throw error;
            }
        },
        [router]
    );

    // 登出
    const logout = useCallback(async () => {
        try {
            await authService.logout();
            setUser(null);
            toast.success("已退出登录");
            router.push("/main");
        } catch (error) {
            // 即使登出失败，也清除本地状态
            setUser(null);
            toast.error("退出登录失败");
        }
    }, [router]);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
