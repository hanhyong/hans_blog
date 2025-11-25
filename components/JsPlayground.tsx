// components/JsPlayground.tsx
"use client";

import { useState } from "react";

type JsPlaygroundProps = {
  initialCode?: string;
};

export default function JsPlayground({
  initialCode = "",
}: JsPlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>("");

  const runCode = () => {
    try {
      const logs: string[] = [];

      const originalLog = console.log;
      console.log = (...args: unknown[]) => {
        logs.push(args.map((a) => String(a)).join(" "));
      };

      // 코드 실행
      // eslint-disable-next-line no-new-func
      const fn = new Function(code);
      const result = fn();

      console.log = originalLog;

      if (result !== undefined) {
        logs.push(String(result));
      }

      setOutput(logs.join("\n") || "(출력 없음)");
    } catch (err: any) {
      setOutput("에러: " + (err?.message ?? String(err)));
    }
  };

  const resetCode = () => {
    setCode(initialCode || "");
    setOutput("");
  };

  return (
    <div className="mt-8 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80">
      <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>JS Playground</span>
        <div className="space-x-2">
          <button
            type="button"
            onClick={resetCode}
            className="px-2 py-1 rounded-md border border-slate-700 hover:border-slate-500 text-[11px]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={runCode}
            className="px-3 py-1 rounded-md bg-emerald-500/90 hover:bg-emerald-400 text-[11px] font-semibold text-slate-950"
          >
            Run ▶
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 md:h-72 p-3 text-xs font-mono bg-slate-950 text-slate-50 border-r border-slate-800 outline-none resize-none"
          spellCheck={false}
        />
        <pre className="w-full h-64 md:h-72 p-3 text-xs font-mono bg-black text-emerald-200 overflow-auto whitespace-pre-wrap">
          {output || "// console.log 출력이 여기에 표시됩니다."}
        </pre>
      </div>
    </div>
  );
}
