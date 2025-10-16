"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthFormProps {
    title: string;
    description: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export function AuthForm({
    title,
    description,
    children,
    footer,
    className,
}: AuthFormProps) {
    return (
        <div className={cn("space-y-8 text-left", className)}>
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">
                    {title}
                </h2>
                <p className="text-sm text-slate-400">{description}</p>
            </div>
            {children}
            {footer ? (
                <div className="text-center text-sm text-slate-500">
                    {footer}
                </div>
            ) : null}
        </div>
    );
}

interface AuthSwitchProps {
    message: string;
    href: string;
    linkLabel: string;
}

export function AuthSwitch({ message, href, linkLabel }: AuthSwitchProps) {
    return (
        <p className="text-center text-sm text-slate-500">
            {message}
            <Link
                href={href}
                className="ml-2 font-medium text-cyan-400 transition hover:text-cyan-300"
            >
                {linkLabel}
            </Link>
        </p>
    );
}
