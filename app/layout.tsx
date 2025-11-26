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
  const year = new Date().getFullYear();

  return (
    <html lang="ko">
      {/* 전체 바디: 거의 검정에 가까운 어두운 갈색 */}
      <body className="bg-[#0b0603] text-[#f6edd8] antialiased">
        {/* 배경: 위는 짙은 갈색, 아래는 거의 검정에 가까운 토양색 (저채도) */}
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#3b2516_0,_#130b07_38%,_#070302_100%)]">
          {/* 머리 위쪽에 아주 옅은 노란빛만 살짝 */}
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0,_rgba(214,162,87,0.24),transparent_55%),radial-gradient(circle_at_80%_0,_rgba(120,85,50,0.18),transparent_60%)] mix-blend-soft-light" />

          <div className="relative z-10 flex min-h-screen flex-col">
            {/* 헤더: 어두운 나무 책상 느낌 */}
            <header className="border-b border-[#3a2617] bg-[#120a06]/95 backdrop-blur">
              <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
                <Link href="/" className="flex items-baseline gap-2">
                  <span className="text-[10px] font-mono tracking-[0.35em] text-[#e8d3a4] uppercase">
                    bio<span className="text-[#d1a96a]">·</span>code
                  </span>
                  <span className="text-sm text-[#f4ead6] font-semibold flex items-center gap-1.5">
                    <span className="text-[13px]">🍂</span>
                    <span>생교 dev log</span>
                  </span>
                </Link>

                <nav className="flex gap-1 text-[11px] font-medium text-[#e2d4b3]">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full px-3 py-1 border border-transparent hover:border-[#e0c99c] hover:bg-[#2a1a10]/85 hover:text-[#f8f0da] transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </header>

            {/* 메인 콘텐츠 영역 */}
            <main className="flex-1">
              <div className="mx-auto flex max-w-4xl px-4 py-8">
                {/* 중앙 카드: 어두운 가죽 노트 + 누런 종이 느낌 */}
                <div className="w-full rounded-3xl border border-[#4a3522] bg-[radial-gradient(circle_at_top_left,_rgba(214,162,87,0.22),transparent_55%),linear-gradient(to_bottom_right,_#1a1009,_#130b07,_#1f1710)] shadow-[0_20px_45px_rgba(5,3,1,0.85)] backdrop-blur-sm">
                  {/* 카드 상단 바: 노트 상단 인덱스 바처럼 */}
                  <div className="border-b border-[#4a3522] px-5 py-3 flex items-center justify-between rounded-t-3xl bg-[linear-gradient(to_right,_rgba(60,40,25,0.9),_rgba(26,17,10,0.98))]">
                    <span className="text-[11px] font-mono text-[#f1e0ba] flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-[#d1a96a] shadow-[0_0_9px_rgba(209,169,106,0.9)]" />
                      {"<"}bio-dev-log{" />"}
                    </span>
                    <span className="text-[10px] text-[#e8d3a4]">
                      JS · Python · VBA · Biology
                    </span>
                  </div>

                  {/* 실제 페이지 내용 */}
                  <div className="px-5 py-5 text-sm text-[#f5edd8]">
                    {children}
                  </div>
                </div>
              </div>
            </main>

            {/* 푸터: 차분한 갈색으로 마무리 */}
            <footer className="border-t border-[#3a2617] bg-[#120a06]/95">
              <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 text-[11px] text-[#e2d4b3]">
                <span>© {year} 생교 dev log</span>
                <span className="space-x-2 flex items-center gap-1">
                  <span className="text-[#d1a96a]">✶</span>
                  <span className="text-[#e8d3a4]/90">quiet notes in code</span>
                  <span className="text-[#c8b89a]/80">·</span>
                  <span className="text-[#e2d4b3]/85">
                    built with Next.js · Tailwind
                  </span>
                </span>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
