// app/blog/series/page.tsx
import Link from "next/link";
import { getAllSeries, getPostsBySeries } from "@/data/posts";

export default function SeriesListPage() {
  const seriesList = getAllSeries();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">프로젝트(시리즈) 목록</h1>
      <p className="text-sm text-slate-300">
        같은 프로젝트에 속한 글들을 시리즈 단위로 모아볼 수 있습니다.
        예를 들어 counter-demo 프로젝트 관련 글들을 한 번에 확인할 수 있어요.
      </p>

      <div className="grid gap-3 mt-4">
        {seriesList.map((series) => {
          const posts = getPostsBySeries(series);
          return (
            <Link
              key={series}
              href={`/blog/series/${series}`}
              className="group rounded-lg border border-slate-800 bg-slate-900/60 p-4 hover:border-emerald-400 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-sm group-hover:text-emerald-300">
                    프로젝트: {series}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {posts.length}개의 글
                  </p>
                </div>
                <span className="text-xs text-slate-500 group-hover:text-emerald-300">
                  들어가기 →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
