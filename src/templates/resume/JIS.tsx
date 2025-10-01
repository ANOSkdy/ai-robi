"use client";

import Image from "next/image";

import { ResumeData } from "../types";

export default function JIS({ data }: { data: ResumeData }) {
  const { profile, education, work, licenses, pr } = data;
  return (
    <div className="resume-jis print-body space-y-6">
      <section className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm text-slate-800">
        <span className="font-semibold text-slate-900">ふりがな</span>
        <span>{profile.nameKana ?? ""}</span>
        <span className="font-semibold text-slate-900">氏名</span>
        <span className="text-xl font-bold text-slate-900">{profile.name || "氏名未入力"}</span>
        <span className="font-semibold text-slate-900">生年月日</span>
        <span>{profile.birth ?? ""}</span>
        <span className="font-semibold text-slate-900">住所</span>
        <span>{profile.address}</span>
        <span className="font-semibold text-slate-900">電話</span>
        <span>{profile.phone}</span>
        <span className="font-semibold text-slate-900">E-mail</span>
        <span>{profile.email}</span>
      </section>
      {profile.avatarUrl ? (
        <div>
          <Image
            src={profile.avatarUrl}
            alt="証明写真"
            width={160}
            height={120}
            className="photo-4x3 h-32 w-40 rounded object-cover"
            unoptimized
          />
        </div>
      ) : null}

      <section className="section avoid-break space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">学歴</h2>
        <ul className="space-y-1 text-sm text-slate-700">
          {education.length > 0 ? (
            education.map((entry, index) => (
              <li key={`jis-edu-${index}`} className="entry flex flex-wrap items-baseline gap-2">
                <span className="font-medium">{entry.start}〜{entry.end ?? ""}</span>
                <span>{entry.title}</span>
                {entry.detail ? <span className="text-slate-500">{entry.detail}</span> : null}
                {entry.status ? <span className="text-slate-500">（{entry.status}）</span> : null}
              </li>
            ))
          ) : (
            <li className="text-slate-500">未入力</li>
          )}
        </ul>
      </section>

      <section className="section avoid-break space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">職歴</h2>
        <ul className="space-y-1 text-sm text-slate-700">
          {work.length > 0 ? (
            work.map((entry, index) => (
              <li key={`jis-work-${index}`} className="entry flex flex-wrap items-baseline gap-2">
                <span className="font-medium">{entry.start}〜{entry.end ?? ""}</span>
                <span>{entry.title}</span>
                {entry.detail ? <span className="text-slate-500">{entry.detail}</span> : null}
                {entry.status ? <span className="text-slate-500">（{entry.status}）</span> : null}
              </li>
            ))
          ) : (
            <li className="text-slate-500">未入力</li>
          )}
        </ul>
      </section>

      <section className="section avoid-break space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">免許・資格</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {licenses.length > 0 ? (
            licenses.map((license, index) => (
              <li key={`jis-license-${index}`}>
                {license.name}
                {license.acquiredOn ? `（${license.acquiredOn}取得）` : ""}
              </li>
            ))
          ) : (
            <li className="list-none text-slate-500">未入力</li>
          )}
        </ul>
      </section>

      {pr?.generated ? (
        <section className="section avoid-break space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">本人希望欄</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{pr.generated}</p>
        </section>
      ) : null}
    </div>
  );
}
