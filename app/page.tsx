import Link from "next/link";
import { posts } from "@/data/posts";

export default function HomePage() {
  const latest = posts.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* 히어로 섹션 */}
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#f6edd8]">
          JS / Python / VBA로 공부하면서 만드는{" "}
          <span className="text-[#d1a96a]">
            인터랙티브 블로그
          </span>
        </h1>
        <p className="text-sm md:text-base max-w-2xl leading-relaxed text-[#e2d4b3]">
          생물교육을 전공하면서 동시에 코딩 공부를 정리하는 공간입니다.
          자바스크립트, 파이썬, VBA를 중심으로 “실행해보면서 이해하는”
          튜토리얼을 목표로 합니다.
        </p>
        <div className="flex gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center px-4 py-2 rounded-md bg-[#d1a96a] text-[#1a1009] font-medium text-sm hover:bg-[#e0c99c] transition-colors"
          >
            블로그 글 보러가기
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center px-4 py-2 rounded-md border border-[#4a3522] text-sm text-[#e2d4b3] hover:border-[#e0c99c] hover:text-[#f8f0da] hover:bg-[rgba(42,26,16,0.9)] transition-colors"
          >
            이 블로그가 궁금하다면
          </Link>
        </div>
      </section>

      {/* 최근 글 섹션 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#f6edd8]">
            최근 글
          </h2>
          <Link
            href="/blog"
            className="text-xs text-[#e2d4b3] hover:text-[#f1e0ba] transition-colors"
          >
            전체 글 보기 →
          </Link>
        </div>

        <div className="grid gap-4">
          {latest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-lg border border-[#4a3522]/70 bg-[rgba(19,11,7,0.96)] p-4 hover:border-[#e0c99c] hover:bg-[rgba(42,26,16,0.98)] transition-colors shadow-sm"
            >
              <div className="text-xs text-[#e2d4b3] mb-1 flex flex-wrap items-center gap-1">
                <span>{post.date}</span>
                {post.tag && (
                  <>
                    <span>·</span>
                    <span className="px-1.5 py-[1px] rounded-full bg-[#3a2617] text-[10px] uppercase tracking-wide text-[#f1e0ba]">
                      {post.tag}
                    </span>
                  </>
                )}
              </div>
              <h3 className="font-semibold group-hover:text-[#f8f0da] text-[#f5edd8]">
                {post.title}
              </h3>
              <p className="text-sm text-[#e2d4b3] mt-1 line-clamp-2">
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
