// src/app/blog/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/data/posts";
import JsPlayground from "@/components/JsPlayground";
import HtmlProjectEmbed from "@/components/HtmlProjectEmbed";

// ✅ Next 15/16에서는 params가 Promise라서 타입도 이렇게 두는 게 깔끔해
type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

// ❌ generateStaticParams는 지금 안 씀 (이미 지운 상태면 OK)
// export function generateStaticParams() { ... }

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // ✅ 여기서 Promise를 풀어줘야 함
  const { slug } = await params;

  const post = getPostBySlug(slug);

  if (!post) {
    console.error("[BlogPostPage] post not found for slug:", slug);
    notFound();
  }

  const paragraphs = post.content
    .split("\n")
    .filter((line) => line.trim() !== "");

  return (
    <article className="space-y-4">
      <header className="space-y-2">
        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-1">
          <span>{post.date}</span>
          <span>·</span>
          <Link
            href={`/blog/folder/${post.folder}`}
            className="underline underline-offset-2 hover:text-emerald-300"
          >
            {post.folder}
          </Link>

          {post.series && (
            <>
              <span>·</span>
              <Link
                href={`/blog/series/${post.series}`}
                className="underline underline-offset-2 hover:text-emerald-300"
              >
                프로젝트: {post.series}
              </Link>
            </>
          )}

          {post.tag && (
            <>
              <span>·</span>
              <span className="px-1.5 py-[2px] rounded bg-slate-800 text-[10px] uppercase tracking-wide">
                {post.tag}
              </span>
            </>
          )}
        </div>

        <h1 className="text-2xl font-semibold">{post.title}</h1>
        <p className="text-sm text-slate-300">{post.description}</p>
      </header>

      <section className="space-y-3 text-sm text-slate-200 leading-relaxed">
        {paragraphs.map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </section>

      {post.demoCode && (
        <section>
          <JsPlayground initialCode={post.demoCode} />
        </section>
      )}

      {post.projects && post.projects.length > 0 && (
        <section className="space-y-3 mt-6">
          <h2 className="text-sm font-semibold text-emerald-300">
            관련 HTML 프로젝트
          </h2>
          <p className="text-xs text-slate-400">
            이 글과 연결된 HTML 프로젝트가 아래 박스에서 바로 실행됩니다. 새 탭에서
            크게 보고 싶으면 &quot;새 탭에서 실행&quot; 버튼을 눌러주세요.
          </p>
          {post.projects.map((slug) => (
            <HtmlProjectEmbed key={slug} slug={slug} />
          ))}
        </section>
      )}
    </article>
  );
}
