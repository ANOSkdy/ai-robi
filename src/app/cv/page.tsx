"use client";
import React from "react";
import { load, useAutosave } from "@/lib/storage/local";

type Exp = { company:string; from:string; to?:string; role?:string; tasks?:string };

export default function Page() {
  const [profile, setProfile] = React.useState(() => load("cv:profile", { summary:"", strengths:"", desiredRole:"" }));
  const [exps, setExps] = React.useState<Exp[]>(() => load("cv:exps", [{ company:"", from:"" }]));
  const [result, setResult] = React.useState<any>(() => load("cv:result", null));
  useAutosave("cv:profile", profile, [profile]);
  useAutosave("cv:exps", exps, [exps]);
  useAutosave("cv:result", result, [result]);

  const add = () => setExps(prev=>[...prev,{company:"",from:""}]);
  const update = (i:number,p:Partial<Exp>)=> setExps(prev=>prev.map((r,idx)=>idx===i?{...r,...p}:r));
  const del = (i:number)=> setExps(prev=>prev.filter((_,idx)=>idx!==i));

  const generate = async () => {
    const res = await fetch("/api/ai/generate-cv", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ jobProfile: profile, experiences: exps })
    });
    const json = await res.json();
    setResult(json);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">職務経歴：入力</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 sm:col-span-3">
          <span>プロフィール要約</span>
          <textarea className="border rounded px-2 py-1 min-h-[80px]"
            value={profile.summary} onChange={e=>setProfile({...profile, summary:e.target.value})}/>
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span>強み</span>
          <input className="border rounded px-2 py-1"
            value={profile.strengths} onChange={e=>setProfile({...profile, strengths:e.target.value})}/>
        </label>
        <label className="flex flex-col gap-1">
          <span>希望ロール</span>
          <input className="border rounded px-2 py-1"
            value={profile.desiredRole} onChange={e=>setProfile({...profile, desiredRole:e.target.value})}/>
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">経験</h3>
          <button className="px-3 py-1 border rounded" onClick={add}>追加</button>
        </div>
        {exps.map((r,i)=>(
          <div key={i} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
            <input className="border rounded px-2 py-1 sm:col-span-2" placeholder="会社名" value={r.company}
              onChange={e=>update(i,{company:e.target.value})}/>
            <input className="border rounded px-2 py-1" placeholder="開始(YYYY-MM-DD)" value={r.from}
              onChange={e=>update(i,{from:e.target.value})}/>
            <input className="border rounded px-2 py-1" placeholder="終了(任意)" value={r.to||""}
              onChange={e=>update(i,{to:e.target.value})}/>
            <input className="border rounded px-2 py-1 sm:col-span-2" placeholder="ロール/主担当" value={r.role||""}
              onChange={e=>update(i,{role:e.target.value})}/>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded" onClick={()=>del(i)}>削除</button>
            </div>
            <input className="border rounded px-2 py-1 sm:col-span-6" placeholder="主なタスク(任意)" value={r.tasks||""}
              onChange={e=>update(i,{tasks:e.target.value})}/>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-black text-white rounded" onClick={generate}>AI要約（雛形）</button>
        <a className="px-4 py-2 border rounded" href="/preview">プレビューへ</a>
      </div>

      {result && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">AI出力（JSON雛形）</h3>
          <pre className="border rounded p-3 whitespace-pre-wrap text-xs">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
