"use client";
import React from "react";
import { load, useAutosave } from "@/lib/storage/local";

export default function Page() {
  const [answers, setAnswers] = React.useState<string[]>(() =>
    load<string[]>("resume:pr:answers", ["","","","",""])
  );
  const [result, setResult] = React.useState<string>(() => load<string>("resume:pr:result",""));
  useAutosave("resume:pr:answers", answers, [answers]);
  useAutosave("resume:pr:result", result, [result]);

  const questions = [
    "1) 強み・得意分野は？",
    "2) 代表的な成果/実績は？（数値あれば）",
    "3) チームでの役割と貢献は？",
    "4) 今後活かしたい経験・スキルは？",
    "5) 志望動機の核は？"
  ];

  const generate = async () => {
    try {
      const res = await fetch("/api/ai/generate-resume", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ answers })
      });
      const json = await res.json();
      setResult(json.prText ?? "");
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">履歴書：自己PR</h2>
      <div className="space-y-3">
        {questions.map((q,i)=>(
          <label key={i} className="flex flex-col gap-1">
            <span>{q}</span>
            <textarea className="border rounded px-2 py-1 min-h-[80px]" value={answers[i]}
              onChange={e=>{
                const next=[...answers]; next[i]=e.target.value; setAnswers(next);
              }} />
          </label>
        ))}
      </div>
      <div className="flex gap-3 items-center">
        <button className="px-4 py-2 bg-black text-white rounded" onClick={generate}>AIで要約（雛形）</button>
        <a className="px-4 py-2 border rounded" href="/preview">プレビューへ</a>
      </div>
      <div>
        <h3 className="font-semibold mt-4 mb-1">生成結果</h3>
        <pre className="border rounded p-3 whitespace-pre-wrap">{result}</pre>
      </div>
    </div>
  );
}
