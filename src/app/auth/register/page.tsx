import type { Metadata } from "next";
import { RegisterForm } from "@/components/domain/auth/register-form";

export const metadata: Metadata = {
    title: "注册",
};

export default function RegisterPage() {
    return <RegisterForm />;
}
