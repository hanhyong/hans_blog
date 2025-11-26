// app/blog/series/[series]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostsBySeries } from "@/data/posts";

// Next.js 15+ 에서는 params가 Promise 여서 이렇게 타입을 잡아야 함
type SeriesParams = Promise<{ series: string }>;

export default async function SeriesPage({
  params,
}: {
  params: SeriesParams;
}) {
  // 여기서 비로소 params를 await 해서 실제 값 꺼냄
  const { series } = await params;
  const seriesKey = decodeURIComponent(series); // 혹시 인코딩된 경우 대비

  const posts = getPostsBySeries(seriesKey);

  if (!posts || posts.length === 0) {
    // 진짜로 이 시리즈에 속한 글이 하나도 없을 때만 404
    notFound();
  }

  const folderSet = new Set(posts.map((p) => p.folder));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">
            프로젝트: {seriesKey}
          </h1>
          <p className="text-sm text-slate-300">
            {posts.length}개의 글 · 폴더: {Array.from(folderSet).join(", ")}
          </p>
        </div>
        <Link
          href="/blog/series"
          className="text-xs text-slate-400 hover:text-emerald-300"
        >
          ← 프로젝트 목록으로
        </Link>
      </div>

      <div className="grid gap-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:border-emerald-400 transition"
          >
            <div className="text-xs text-slate-400 mb-1 flex flex-wrap items-center gap-1">
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.folder}</span>
              {post.tag && (
                <>
                  <span>·</span>
                  <span className="px-1.5 py-[2px] rounded bg-slate-800 text-[10px] uppercase tracking-wide">
                    {post.tag}
                  </span>
                </>
              )}
            </div>
            <h2 className="font-semibold group-hover:text-emerald-300">
              {post.title}
            </h2>
            <p className="text-sm text-slate-300 mt-1 line-clamp-2">
              {post.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
