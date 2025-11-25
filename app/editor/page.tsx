// src/app/editor/page.tsx
"use client";

import { useMemo, useState } from "react";

function todayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function makeSlugFromTitle(title: string): string {
  if (!title.trim()) return "";
  const base = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
  if (!base) {
    return `post-${todayString()}`;
  }
  return base;
}

function escapeForTsString(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/"/g, '\\"');
}

export default function EditorPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState(todayString());
  const [folder, setFolder] = useState("javascript");
  const [tag, setTag] = useState("note");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [demoCode, setDemoCode] = useState("");

  const generatedSnippet = useMemo(() => {
    if (!title.trim()) {
      return "// 제목은 최소한 입력해야 코드 스니펫이 생성됩니다.";
    }

    const safeSlug = slug.trim() || makeSlugFromTitle(title);
    const safeTitle = escapeForTsString(title.trim());
    const safeFolder = escapeForTsString(folder.trim() || "misc");
    const safeTag = escapeForTsString(tag.trim() || "note");
    const safeDescription = escapeForTsString(
      description.trim() || "설명 없음"
    );

    const contentString = content || "";
    const demoString = demoCode.trim();

    const lines: string[] = [];
    lines.push("{");
    lines.push(`  slug: "${safeSlug}",`);
    lines.push(`  title: "${safeTitle}",`);
    lines.push(`  date: "${date}",`);
    lines.push(`  folder: "${safeFolder}",`);
    lines.push(`  tag: "${safeTag}",`);
    lines.push(`  description: "${safeDescription}",`);
    lines.push(
      `  content: ${JSON.stringify(contentString)
        .split("\\n")
        .join("\\n")},`
    );
    if (demoString) {
      lines.push(
        `  demoCode: ${JSON.stringify(demoString)
          .split("\\n")
          .join("\\n")},`
      );
    }
    lines.push("},");

    return lines.join("\n");
  }, [title, slug, date, folder, tag, description, content, demoCode]);

  const previewParagraphs = useMemo(
    () =>
      (content || "")
        .split("\n")
        .filter((l) => l.trim() !== ""),
    [content]
  );

  const handleAutoSlug = () => {
    const s = makeSlugFromTitle(title);
    setSlug(s);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">블로그 글 작성 에디터</h1>
      <p className="text-sm text-slate-300">
        이 페이지에서 글 메타데이터와 내용을 입력하면,
        <br />
        아래에서 미리보기와 <code>posts.ts</code>에 붙여넣을 코드 스니펫을
        한 번에 확인할 수 있습니다.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 왼쪽: 입력 폼 */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              제목 (title)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              placeholder="예) 블로그 안에서 JS 코드 실행하기 (Playground 초안)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                슬러그 (slug, URL용)
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                placeholder="예) js-playground-basics"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAutoSlug}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs hover:border-emerald-400 hover:text-emerald-300"
              >
                제목으로부터 슬러그 자동 생성
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                날짜 (date)
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                폴더 (folder, 대분류)
              </label>
              <input
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                placeholder="예) javascript / python / vba / intro ..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                태그 (tag, 세부 키워드)
              </label>
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                placeholder="예) playground / concept / tutorial ..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              설명 (description)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-20 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400 resize-none"
              placeholder="글의 요약이나 소개 문장을 짧게 적어 주세요."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-emerald-300 mb-1">
              본문 (content)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-40 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono outline-none focus:border-emerald-400"
              placeholder={[
                "여기에 본문을 적습니다.",
                "줄바꿈은 그대로 단락으로 나뉘어 렌더링됩니다.",
                "",
                "예시:",
                "이 글에서는 블로그 안에서 JS 코드를 실행할 수 있는 간단한 플레이그라운드를 만들어 봅니다.",
                "",
                "아래에 JS 데모 코드를 작성하면, 글 상세 페이지에 Playground가 함께 붙습니다.",
              ].join("\n")}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-emerald-300 mb-1">
              JS 데모 코드 (demoCode, 선택)
            </label>
            <textarea
              value={demoCode}
              onChange={(e) => setDemoCode(e.target.value)}
              className="w-full h-32 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono outline-none focus:border-emerald-400"
              placeholder={[
                "// 여기 입력하면 JsPlayground에 기본 코드로 들어갑니다.",
                "console.log('hello dev log');",
              ].join("\n")}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              비워두면 Playground가 붙지 않습니다. <code>posts.ts</code>의
              <code>demoCode</code> 필드가 없는 글과 동일하게 처리돼요.
            </p>
          </div>
        </div>

        {/* 오른쪽: 미리보기 + 코드 스니펫 */}
        <div className="space-y-4">
          <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold mb-2 text-emerald-300">
              미리보기
            </h2>
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-1">
                <span>{date}</span>
                <span>·</span>
                <span>{folder || "folder"}</span>
                <span>·</span>
                <span className="px-1.5 py-[2px] rounded bg-slate-800 text-[10px] uppercase tracking-wide">
                  {tag || "tag"}
                </span>
              </div>
              <div className="text-lg font-semibold">
                {title || "제목 미입력"}
              </div>
              <p className="text-sm text-slate-300">
                {description || "설명 미입력"}
              </p>
              <hr className="border-slate-800 my-2" />
              <div className="space-y-2 text-sm text-slate-200 leading-relaxed">
                {previewParagraphs.length === 0 && (
                  <p className="text-slate-500">
                    아직 본문이 없습니다. 위에 내용을 작성하면 단락 단위로
                    미리보기가 표시됩니다.
                  </p>
                )}
                {previewParagraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
              {demoCode.trim() && (
                <div className="mt-3 rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-300">
                  이 글에는 JS Playground가 함께 붙습니다. (demoCode 설정됨)
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold mb-2 text-emerald-300">
              posts.ts에 붙여넣을 코드 스니펫
            </h2>
            <p className="text-[11px] text-slate-400 mb-2">
              아래 내용을 <code>src/data/posts.ts</code>의{" "}
              <code>posts</code> 배열 안에 붙여넣으면 됩니다.
            </p>
            <pre className="max-h-80 overflow-auto rounded-md bg-black/80 p-3 text-[11px] font-mono text-emerald-200">
{generatedSnippet}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
