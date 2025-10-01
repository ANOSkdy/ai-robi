"use client";

import Image from "next/image";

import { ResumeData } from "../types";

export default function Standard({ data }: { data: ResumeData }) {
  const { profile, education, work, licenses, pr, career } = data;
  return (
    <div className="resume-standard print-body space-y-6">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-900">{profile.name || "氏名未入力"}</h1>
        {profile.nameKana ? <p className="text-sm text-slate-600">{profile.nameKana}</p> : null}
        <div className="mt-2 text-sm text-slate-700">
          <span>{profile.address}</span>
          <span className="mx-2">/</span>
          <span>{profile.phone}</span>
          <span className="mx-2">/</span>
          <span>{profile.email}</span>
        </div>
        {profile.birth ? <p className="mt-1 text-sm text-slate-600">生年月日: {profile.birth}</p> : null}
        {profile.avatarUrl ? (
          <div className="mt-4">
            <Image
              src={profile.avatarUrl}
              alt="プロフィール写真"
              width={160}
              height={120}
              className="photo-4x3 h-32 w-40 rounded object-cover"
              unoptimized
            />
          </div>
        ) : null}
      </header>

      <section className="section avoid-break space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">学歴</h2>
        <ul className="space-y-1 text-sm text-slate-700">
          {education.length > 0 ? (
            education.map((entry, index) => (
              <li key={`edu-${index}`} className="entry flex flex-wrap items-baseline gap-2">
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
              <li key={`work-${index}`} className="entry flex flex-wrap items-baseline gap-2">
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
              <li key={`license-${index}`}>
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
          <h2 className="text-lg font-semibold text-slate-900">自己PR</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{pr.generated}</p>
        </section>
      ) : null}

      {career?.generatedCareer ? (
        <section className="section avoid-break space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">職務経歴</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{career.generatedCareer}</p>
        </section>
      ) : null}
    </div>
  );
}
