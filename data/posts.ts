// src/data/posts.ts
// data/posts.ts

export type Post = {
  slug: string;          // /blog/[slug] 에서 쓸 URL
  title: string;
  date: string;

  folder: string;        // 언어 / 큰 분류 (javascript, python, vba ...)
  series?: string;       // 같은 프로젝트(시리즈)에 묶일 때 쓰는 ID (예: "counter-demo")

  tag?: string;          // 세부 키워드 (없어도 되게 ? 처리)
  description: string;
  content: string;

  demoCode?: string;     // JS Playground용 코드
  projects?: string[];   // HTML 임베드 프로젝트 슬러그들
};

export const posts: Post[] = [
  {
    slug: "welcome-to-dev-log",
    title: "블로그를 만든 이유와 전체 방향",
    date: "2025-11-22",
    folder: "intro",
    series: "counter-demo4",
    tag: "intro",
    description:
      "생물교육 전공자가 왜 JS / Python / VBA 블로그를 만들었는지, 그리고 이 공간을 어떻게 포트폴리오로 활용할 계획인지 정리합니다.",
    content: [
      "이 블로그는 두 가지 목표를 가지고 있습니다.",
      "",
      "1. 내가 이해한 내용을 글과 코드로 정리해서, 나중에 다시 봐도 도움이 되도록 만들기.",
      "2. 이 블로그 자체를 하나의 작은 프로덕트로 키워서, 포트폴리오로 보여줄 수 있는 결과물로 만들기.",
      "",
      "초기에는 JS / Python / VBA 기초와, 실제로 수업이나 일상 자동화에 쓸 수 있는 예제를 중심으로 글을 쓸 예정입니다.",
      "나중에는 인터랙티브 튜토리얼, 코드 실행기 고도화, 생물 수업용 시뮬레이션 등으로 확장해 볼 계획입니다.",
    ].join("\n"),
  },
  {
    slug: "js-playground-basics",
    title: "블로그 안에서 JS 코드 실행하기 (Playground 초안)",
    date: "2025-11-22",
    folder: "javascript",
    series: "counter-demo3",
    tag: "playground",
    description:  
      "Next.js와 간단한 컴포넌트를 이용해서, 블로그 글 안에서 바로 JS 코드를 실행해보는 플레이그라운드를 만듭니다.",
    content: [
      "이 글에서는 아주 단순한 JS 실행기를 블로그에 붙여 봅니다.",
      "",
      "아래 코드 박스에서 console.log를 사용해 값을 출력해 볼 수 있습니다.",
      "브라우저에서 코드를 직접 실행해 보면서 문법을 익히는 것이 목표입니다.",
    ].join("\n"),
  },
  {
    slug: "vba-why-it-is-still-useful",
    title: "VBA는 왜 아직도 실무에서 많이 쓰일까?",
    date: "2025-11-22",
    folder: "vba",
    series: "counter-demo2",
    tag: "concept",
    description:
      "엑셀 VBA가 여전히 사라지지 않는 이유와, 이 블로그에서 VBA를 다루는 방식에 대해 정리합니다.",
    content: [
      "VBA는 브라우저에서 바로 실행할 수는 없지만, 여전히 많은 현장에서 엑셀 자동화 용도로 쓰이고 있습니다.",
      "",
      "이 블로그에서는 VBA 코드를 설명하고, 예제 파일(.xlsm)을 제공하는 방식으로 정리할 예정입니다.",
      "나중에는 같은 작업을 JS나 Python으로 옮겨보는 비교 글도 써 볼 계획입니다.",
    ].join("\n"),
  },
  {
    slug: "post-2025-11-24",
    title: "안녕하세요",
    date: "2002-03-30",
    folder: "javascript",
    series: "counter-demo1",
    tag: "note",
    description: "설명 없음",
    content: "오늘은 밥을 먹었따",
  },
  {
    slug: "embed-html-counter-demo",
    title: "HTML 카운터 데모를 블로그 글에 임베드해보기",
    date: "2025-11-26",
    folder: "javascript",
    series: "counter-demo",          // ★ 프로젝트/시리즈 ID
    tag: "demo",
    description: "public/projects 안에 있는 HTML 프로젝트를 블로그 글 안에 iframe으로 임베드하고, 새 탭으로 바로 실행하는 방법을 정리합니다.",
    content: "이 글에서는 public/projects 폴더 안에 있는 HTML 프로젝트를 블로그 글 안에 직접 임베드하는 방법을 정리합니다.\n\n먼저, public/projects/counter-demo/index.html 파일을 만들어 간단한 카운터 예제를 작성합니다. 그런 다음, data/posts.ts에서 이 글에 projects: [\"counter-demo\"]를 연결하면 됩니다.\n\n아래 박스에서 카운터 데모를 바로 실행해 볼 수 있습니다. 프로젝트 전체 화면이 보고 싶다면 \"새 탭에서 실행\" 버튼을 눌러 확인할 수 있습니다.\n",
    projects: ["counter-demo"],
  },
  {
    slug: "post-2025-11-26",
    title: "커피내기",
    date: "2025-11-26",
    folder: "javascript",
    series: "project_coffee",
    tag: "game",
    description: "롤로 커피내기",
    content: "커피내기 하는 프로그램입니다.",
    projects: ["coffee"],
  },
];
export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getFolders(): string[] {
  return Array.from(new Set(posts.map((p) => p.folder))).sort();
}

export function getPostsByFolder(folder: string): Post[] {
  return posts.filter((p) => p.folder === folder);
}

// 특정 folder 안에서 사용 중인 시리즈 목록
export function getSeriesByFolder(folder: string): string[] {
  const set = new Set<string>();
  for (const p of posts) {
    if (p.folder === folder && p.series) {
      set.add(p.series);
    }
  }
  return Array.from(set).sort();
}

// 특정 folder + series 조합의 글들
export function getPostsBySeriesAndFolder(
  series: string,
  folder: string
): Post[] {
  return posts.filter(
    (p) => p.folder === folder && p.series === series
  );
}

// folder 안에서 series가 없는(단독) 글들
export function getPostsWithoutSeriesByFolder(folder: string): Post[] {
  return posts.filter((p) => p.folder === folder && !p.series);
}

// 시리즈 ID로 전역 검색
export function getPostsBySeries(series: string): Post[] {
  return posts.filter((p) => p.series === series);
}

// 존재하는 시리즈 ID 목록
export function getAllSeries(): string[] {
  const set = new Set<string>();
  for (const p of posts) {
    if (p.series) set.add(p.series);
  }
  return Array.from(set).sort();
}
