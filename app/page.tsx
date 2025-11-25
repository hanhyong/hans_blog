import Link from "next/link";
import { posts } from "@/data/posts";

export default function HomePage() {
  const latest = posts.slice(0, 3);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          JS / Python / VBA로 공부하면서 만드는{" "}
          <span className="text-emerald-300">인터랙티브 블로그</span>
        </h1>
        <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
          생물교육을 전공하면서 동시에 코딩 공부를 정리하는 공간입니다.
          자바스크립트, 파이썬, VBA를 중심으로 “실행해보면서 이해하는”
          튜토리얼을 목표로 합니다.
        </p>
        <div className="flex gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-500 text-slate-950 font-medium text-sm hover:bg-emerald-400 transition"
          >
            블로그 글 보러가기
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center px-4 py-2 rounded-md border border-slate-600 text-sm hover:border-emerald-400 hover:text-emerald-300 transition"
          >
            이 블로그가 궁금하다면
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">최근 글</h2>
          <Link
            href="/blog"
            className="text-xs text-slate-400 hover:text-emerald-300"
          >
            전체 글 보기 →
          </Link>
        </div>

        <div className="grid gap-4">
          {latest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:border-emerald-400 transition"
            >
              <div className="text-xs text-slate-400 mb-1">
                {post.date} · {post.tag}
              </div>
              <h3 className="font-semibold group-hover:text-emerald-300">
                {post.title}
              </h3>
              <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
