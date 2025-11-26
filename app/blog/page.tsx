// app/blog/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getFolders,
  getSeriesByFolder,
  getPostsByFolder,
  getPostsBySeriesAndFolder,
  getPostsWithoutSeriesByFolder,
} from "@/data/posts";

type FolderOpenState = Record<string, boolean>;
type SeriesOpenState = Record<string, boolean>;

export default function BlogListPage() {
  const folders = getFolders();

  const [openFolders, setOpenFolders] = useState<FolderOpenState>({});
  const [openSeries, setOpenSeries] = useState<SeriesOpenState>({});

  const toggleFolder = (folder: string) => {
    setOpenFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  const toggleSeries = (folder: string, seriesKey: string) => {
    const key = `${folder}:${seriesKey}`;
    setOpenSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isSeriesOpen = (folder: string, seriesKey: string) =>
    !!openSeries[`${folder}:${seriesKey}`];

  return (
    <div className="space-y-4">
      {/* 상단 헤더: 어두운 갈색 그라데이션 + 저채도 베이지 텍스트 */}
      <header className="rounded-xl border border-[#4a3522]/70 bg-[linear-gradient(to_right,_rgba(60,40,25,0.9),_rgba(26,17,10,0.96))] px-5 py-4 shadow-md">
        <h1 className="text-2xl font-semibold text-[#f6edd8]">블로그</h1>
        <p className="mt-1 text-sm text-[#e2d4b3]">
          언어(대분류) ▸ 프로젝트(시리즈) ▸ 글 구조로 정리되어 있어요.{" "}
          삼각형(▶ / ▼)을 눌러서 단계별로 천천히 펼쳐보면 됩니다.
        </p>
      </header>

      <div className="space-y-3">
        {folders.map((folder) => {
          const folderPosts = getPostsByFolder(folder);
          const seriesList = getSeriesByFolder(folder);
          const loosePosts = getPostsWithoutSeriesByFolder(folder);

          const projectCount = seriesList.length;
          const folderOpen = !!openFolders[folder];

          return (
            <section
              key={folder}
              className="rounded-xl border border-[#3a2617] bg-[rgba(18,10,6,0.9)] shadow-[0_10px_28px_rgba(0,0,0,0.6)]"
            >
              {/* 1단계: 언어/대분류 헤더 */}
              <button
                type="button"
                onClick={() => toggleFolder(folder)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[rgba(42,26,16,0.9)] transition-colors rounded-t-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#e2d4b3]">
                    {folderOpen ? "▼" : "▶"}
                  </span>
                  <span className="text-sm font-semibold text-[#f5edd8]">
                    {folder}
                  </span>
                </div>
                <div className="text-[11px] text-[#e2d4b3] flex items-center gap-2">
                  <span>프로젝트 {projectCount}개</span>
                  <span>·</span>
                  <span>글 {folderPosts.length}개</span>
                </div>
              </button>

              {/* 언어 안 내용 (프로젝트 + 단일 글) */}
              <div
                className={`px-4 pb-3 pt-0 overflow-hidden transition-[max-height,opacity] duration-200 ${
                  folderOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="mt-2 space-y-3">
                  {/* 2단계: 각 프로젝트(시리즈) */}
                  {seriesList.map((series) => {
                    const postsInSeries = getPostsBySeriesAndFolder(
                      series,
                      folder
                    );
                    if (postsInSeries.length === 0) return null;

                    const open = isSeriesOpen(folder, series);

                    return (
                      <div
                        key={series}
                        className="rounded-lg border border-[#4a3522] bg-[rgba(19,11,7,0.98)]"
                      >
                        {/* 프로젝트 헤더 */}
                        <button
                          type="button"
                          onClick={() => toggleSeries(folder, series)}
                          className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[rgba(42,26,16,0.9)] transition-colors rounded-t-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#e2d4b3]">
                              {open ? "▼" : "▶"}
                            </span>
                            <span className="text-sm font-medium text-[#f5edd8]">
                              프로젝트: {series}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#e2d4b3]">
                            글 {postsInSeries.length}개
                          </span>
                        </button>

                        {/* 프로젝트 안 글 목록 */}
                        <div
                          className={`px-3 pb-2 overflow-hidden transition-[max-height,opacity] duration-200 ${
                            open
                              ? "max-h-[800px] opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="mt-2 grid gap-2">
                            {postsInSeries.map((post) => (
                              <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group rounded-md border border-[#4a3522]/70 bg-[rgba(26,16,10,0.96)] px-3 py-2 hover:border-[#e0c99c] hover:bg-[rgba(42,26,16,0.98)] transition"
                              >
                                <div className="text-[11px] text-[#e2d4b3] mb-1 flex flex-wrap items-center gap-1">
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
                                <div className="text-sm font-medium group-hover:text-[#f8f0da] text-[#f5edd8]">
                                  {post.title}
                                </div>
                                <p className="text-xs text-[#e2d4b3] mt-1 line-clamp-2">
                                  {post.description}
                                </p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* 프로젝트에 속하지 않은 단독 글들 */}
                  {loosePosts.length > 0 && (
                    <div className="rounded-lg border border-[#4a3522] bg-[rgba(19,11,7,0.98)]">
                      <button
                        type="button"
                        onClick={() => toggleSeries(folder, "__single__")}
                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[rgba(42,26,16,0.9)] transition-colors rounded-t-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#e2d4b3]">
                            {isSeriesOpen(folder, "__single__") ? "▼" : "▶"}
                          </span>
                          <span className="text-sm font-medium text-[#f5edd8]">
                            단일 글
                          </span>
                        </div>
                        <span className="text-[11px] text-[#e2d4b3]">
                          글 {loosePosts.length}개
                        </span>
                      </button>

                      <div
                        className={`px-3 pb-2 overflow-hidden transition-[max-height,opacity] duration-200 ${
                          isSeriesOpen(folder, "__single__")
                            ? "max-h-[800px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="mt-2 grid gap-2">
                          {loosePosts.map((post) => (
                            <Link
                              key={post.slug}
                              href={`/blog/${post.slug}`}
                              className="group rounded-md border border-[#4a3522]/70 bg-[rgba(26,16,10,0.96)] px-3 py-2 hover:border-[#e0c99c] hover:bg-[rgba(42,26,16,0.98)] transition"
                            >
                              <div className="text-[11px] text-[#e2d4b3] mb-1 flex flex-wrap items-center gap-1">
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
                              <div className="text-sm font-medium group-hover:text-[#f8f0da] text-[#f5edd8]">
                                {post.title}
                              </div>
                              <p className="text-xs text-[#e2d4b3] mt-1 line-clamp-2">
                                {post.description}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
