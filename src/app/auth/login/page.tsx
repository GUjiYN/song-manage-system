import type { Metadata } from "next";
import { LoginForm } from "@/components/domain/auth/login-form";

export const metadata: Metadata = {
    title: "登录",
};

export default function LoginPage() {
    return <LoginForm />;
}
