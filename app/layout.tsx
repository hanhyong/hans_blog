// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "생교 dev log",
  description: "생물교육 전공자의 JS / Python / VBA 인터랙티브 개발 블로그",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-950 text-slate-50 antialiased">
        {/* 전체 배경: 위쪽은 에메랄드, 아래는 딥 네이비 */}
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#022c22_0,_#020617_45%,_#020617_100%)] text-slate-50">
          {/* 위에서 퍼지는 형광 초록빛 오라 */}
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.16),transparent_55%)]" />

          {/* 내용 영역 */}
          <div className="relative z-10 flex min-h-screen flex-col">
            {/* 헤더 */}
            <header className="border-b border-emerald-900/60 bg-slate-950/80 backdrop-blur">
              <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
                <Link href="/" className="flex items-baseline gap-2">
                  <span className="text-[10px] font-mono tracking-[0.35em] text-emerald-300/80 uppercase">
                    bio<span className="text-sky-300">·</span>code
                  </span>
                  <span className="text-sm text-slate-200">생교 dev log</span>
                </Link>

                <nav className="flex gap-1 text-[11px] font-medium text-slate-300">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full px-3 py-1 hover:bg-emerald-500/10 hover:text-emerald-200 border border-transparent hover:border-emerald-500/40 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="flex-1">
              <div className="mx-auto flex max-w-4xl px-4 py-8">
                <div className="w-full rounded-3xl border border-emerald-900/40 bg-slate-950/70 shadow-[0_0_40px_rgba(16,185,129,0.25)]/40 backdrop-blur-sm">
                  <div className="border-b border-emerald-900/40 px-5 py-3 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-300">
                      {"<"}bio-dev-log{" />"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      JS · Python · VBA · Biology
                    </span>
                  </div>
                  <div className="px-5 py-5">{children}</div>
                </div>
              </div>
            </main>

            {/* 푸터 */}
            <footer className="border-t border-slate-800 bg-slate-950/85">
              <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 text-[11px] text-slate-500">
                <span>© {new Date().getFullYear()} 생교 dev log</span>
                <span className="space-x-2">
                  <span className="text-emerald-400">∴</span>
                  <span>built with Next.js · Tailwind</span>
                </span>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
