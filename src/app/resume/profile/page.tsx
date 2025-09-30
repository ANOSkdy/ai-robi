"use client";
import React from "react";
import { load, useAutosave } from "@/lib/storage/local";

type Profile = {
  name: string; kana?: string; birth: string; address: string;
  email?: string; phone?: string;
};

export default function Page() {
  const [form, setForm] = React.useState<Profile>(() =>
    load<Profile>("resume:profile", { name:"", birth:"", address:"" })
  );
  useAutosave("resume:profile", form);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">履歴書：プロフィール</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span>氏名 *</span>
          <input className="border rounded px-2 py-1" value={form.name}
            onChange={e=>setForm({...form, name:e.target.value})}/>
        </label>
        <label className="flex flex-col gap-1">
          <span>ふりがな</span>
          <input className="border rounded px-2 py-1" value={form.kana||""}
            onChange={e=>setForm({...form, kana:e.target.value})}/>
        </label>
        <label className="flex flex-col gap-1">
          <span>生年月日 (YYYY-MM-DD) *</span>
          <input className="border rounded px-2 py-1" placeholder="1990-01-01" value={form.birth}
            onChange={e=>setForm({...form, birth:e.target.value})}/>
        </label>
        <label className="flex flex-col gap-1">
          <span>住所 *</span>
          <input className="border rounded px-2 py-1" value={form.address}
            onChange={e=>setForm({...form, address:e.target.value})}/>
        </label>
        <label className="flex flex-col gap-1">
          <span>メール</span>
          <input className="border rounded px-2 py-1" value={form.email||""}
            onChange={e=>setForm({...form, email:e.target.value})}/>
        </label>
        <label className="flex flex-col gap-1">
          <span>電話番号</span>
          <input className="border rounded px-2 py-1" value={form.phone||""}
            onChange={e=>setForm({...form, phone:e.target.value})}/>
        </label>
      </div>
      <div className="flex gap-3">
        <a className="px-4 py-2 border rounded" href="/resume/history">学歴・職歴へ</a>
      </div>
    </div>
  );
}
