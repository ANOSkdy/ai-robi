"use client";
import React from "react";
import { load, useAutosave } from "@/lib/storage/local";

type Row = { yyyymm: string; org: string; kind: "入学"|"卒業"|"中途退学"|"入社"|"退社"|"開業"|"閉業"; detail?: string };
export default function Page() {
  const [rows, setRows] = React.useState<Row[]>(() =>
    load<Row[]>("resume:history", [{ yyyymm:"", org:"", kind:"入学" }])
  );
  useAutosave("resume:history", rows);

  const update = (i:number, partial:Partial<Row>) =>
    setRows(prev => prev.map((r,idx)=> idx===i ? {...r, ...partial} : r));
  const add = () => setRows(prev => [...prev, { yyyymm:"", org:"", kind:"入学" }]);
  const del = (i:number) => setRows(prev => prev.filter((_,idx)=>idx!==i));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">履歴書：学歴・職歴</h2>
      <div className="space-y-3">
        {rows.map((r,i)=>(
          <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
            <input className="border rounded px-2 py-1" placeholder="YYYY-MM" value={r.yyyymm}
              onChange={e=>update(i,{yyyymm:e.target.value})}/>
            <input className="border rounded px-2 py-1 sm:col-span-2" placeholder="学校/会社名" value={r.org}
              onChange={e=>update(i,{org:e.target.value})}/>
            <select className="border rounded px-2 py-1" value={r.kind}
              onChange={e=>update(i,{kind:e.target.value as Row["kind"]})}>
              {["入学","卒業","中途退学","入社","退社","開業","閉業"].map(k=><option key={k} value={k}>{k}</option>)}
            </select>
            <div className="flex gap-2">
              <button className="px-2 py-1 border rounded" onClick={()=>del(i)}>削除</button>
            </div>
            <input className="border rounded px-2 py-1 sm:col-span-5" placeholder="詳細(任意)" value={r.detail||""}
              onChange={e=>update(i,{detail:e.target.value})}/>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button className="px-3 py-1 border rounded" onClick={add}>行を追加</button>
        <a className="px-4 py-2 border rounded" href="/resume/pr">自己PRへ</a>
      </div>
    </div>
  );
}
