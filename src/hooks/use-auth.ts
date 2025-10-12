/**
 * 认证 Hook
 * 用于在组件中访问认证上下文
 */

import { useContext } from "react";
import { AuthContext } from "@/contexts/auth-context";

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth 必须在 AuthProvider 内部使用");
    }

    return context;
}
