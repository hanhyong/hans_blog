// components/HtmlProjectEmbed.tsx
"use client";

type HtmlProjectEmbedProps = {
  slug: string;          // 예: "counter-demo"
  title?: string;        // 박스 상단에 보여줄 제목 (없으면 slug 사용)
  height?: number;       // iframe 높이 (기본 360)
};

export default function HtmlProjectEmbed({
  slug,
  title,
  height = 360,
}: HtmlProjectEmbedProps) {
  const src = `/projects/${slug}/index.html`;
  const displayTitle = title || slug;

  return (
    <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/70 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex flex-col">
          <span className="font-medium text-slate-100">{displayTitle}</span>
          <span className="text-[11px] text-slate-400">
            /projects/{slug}/index.html
          </span>
        </div>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="px-2 py-1 rounded border border-slate-700 hover:border-emerald-400 hover:text-emerald-300"
        >
          새 탭에서 실행
        </a>
      </div>

      <div className="bg-black">
        <iframe
          src={src}
          title={displayTitle}
          style={{ width: "100%", height }}
          className="border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
