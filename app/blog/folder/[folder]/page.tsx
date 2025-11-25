// app/blog/folder/[folder]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostsByFolder } from "@/data/posts";

type FolderPageProps = {
  // ✅ Next 15/16: params는 Promise로 들어온다
  params: Promise<{ folder: string }>;
};

export default async function FolderPage({ params }: FolderPageProps) {
  // ✅ 여기서 Promise를 풀어서 folder 값을 꺼낸다
  const { folder } = await params;

  const posts = getPostsByFolder(folder);

  if (!posts || posts.length === 0) {
    console.error("[FolderPage] no posts for folder:", folder);
    notFound(); // → 404 페이지
  }

  return (
    <section className="space-y-4">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[11px] font-mono text-emerald-300 uppercase tracking-[0.2em]">
            Folder
          </p>
          <h1 className="text-xl font-semibold text-slate-50">
            {folder}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            이 폴더에는 {posts.length}개의 글이 있습니다.
          </p>
        </div>

        {/* 뒤로 가기: 폴더 목록 = /blog */}
        <Link
          href="/blog"
          className="text-[11px] text-slate-300 underline underline-offset-4 hover:text-emerald-300"
        >
          ← 카테고리 목록으로
        </Link>
      </header>

      <div className="grid gap-3">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="group rounded-2xl border border-emerald-900/40 bg-slate-950/60 p-4 hover:border-emerald-400/70 hover:bg-slate-950/90 transition-colors shadow-[0_0_0_rgba(16,185,129,0)] hover:shadow-[0_0_24px_rgba(16,185,129,0.35)]"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-300">
                {post.date}
              </span>
              {post.tag && (
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] uppercase tracking-wide text-sky-300 border border-sky-500/50">
                  {post.tag}
                </span>
              )}
            </div>
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-sm font-semibold text-slate-50 group-hover:text-emerald-200">
                {post.title}
              </h2>
            </Link>
            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
              {post.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
