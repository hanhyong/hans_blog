// app/blog/page.tsx
import Link from "next/link";
import { getFolders, getPostsByFolder } from "@/data/posts";

export default function BlogIndexPage() {
  const folders = getFolders(); // intro, javascript, vba ...

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <p className="text-[11px] font-mono text-emerald-300 uppercase tracking-[0.2em]">
          Blog
        </p>
        <h1 className="text-xl font-semibold text-slate-50">
          카테고리별 글 모아보기
        </h1>
        <p className="text-xs text-slate-400">
          생물 + 코딩 관련 글들을 폴더별로 정리해 둔 아카이브입니다.
        </p>
      </header>

      <div className="grid gap-3">
        {folders.map((folder) => {
          const posts = getPostsByFolder(folder);
          const latest = posts[0];

          return (
            <Link key={folder} href={`/blog/folder/${folder}`}>
              <article className="group rounded-2xl border border-emerald-900/40 bg-slate-950/60 p-4 hover:border-emerald-400/70 hover:bg-slate-950/90 transition-colors shadow-[0_0_0_rgba(16,185,129,0)] hover:shadow-[0_0_24px_rgba(16,185,129,0.35)] cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-semibold text-slate-50 group-hover:text-emerald-200">
                    {folder}
                  </h2>
                  <span className="text-[11px] font-mono text-emerald-300">
                    {posts.length} posts
                  </span>
                </div>
                {latest && (
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {latest.description}
                  </p>
                )}
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
