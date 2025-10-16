import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "账户访问",
        template: "%s | 歌曲管理系统",
    },
    description: "登录或注册歌曲管理系统账户",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-cyan-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_55%)]" />
            <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6">
                <div className="w-full max-w-md space-y-7 text-center text-slate-700">
                    <div className="space-y-3">
                        <span className="inline-flex items-center rounded-full border border-sky-100 bg-white/80 px-4 py-1 text-[11px] font-semibold tracking-[0.3em] text-sky-500 shadow-sm shadow-sky-100">
                            SONG MANAGER
                        </span>
                        <h1 className="text-3xl font-semibold text-slate-900">
                            歌单管理系统
                        </h1>
                        <p className="text-sm text-slate-500">
                            登录或注册以管理您的音乐世界
                        </p>
                    </div>
                    <div className="rounded-3xl border border-white/80 bg-white/90 p-8 shadow-xl shadow-sky-100/60 backdrop-blur-sm">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
