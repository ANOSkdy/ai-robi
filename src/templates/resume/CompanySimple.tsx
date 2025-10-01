"use client";

import Image from "next/image";

import { ResumeData } from "../types";

export default function CompanySimple({ data }: { data: ResumeData }) {
  const { profile, pr, career, licenses, work } = data;
  const highlightedLicenses = licenses.slice(0, 3);
  const recentWork = work.slice(-3).reverse();

  return (
    <div className="resume-company-simple print-body space-y-6">
      <header className="space-y-2 border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-900">{profile.name || "氏名未入力"}</h1>
        <p className="text-sm text-slate-600">{profile.email} ／ {profile.phone}</p>
        {profile.address ? <p className="text-sm text-slate-600">{profile.address}</p> : null}
        {profile.avatarUrl ? (
          <div>
            <Image
              src={profile.avatarUrl}
              alt="プロフィール写真"
              width={160}
              height={120}
              className="photo-4x3 mt-2 h-32 w-40 rounded object-cover"
              unoptimized
            />
          </div>
        ) : null}
      </header>

      {highlightedLicenses.length > 0 ? (
        <section className="section avoid-break space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">プロフィール要約</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {highlightedLicenses.map((license, index) => (
              <li key={`simple-license-${index}`}>{license.name}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {recentWork.length > 0 ? (
        <section className="section avoid-break space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">主な職務経歴</h2>
          <ul className="space-y-1 text-sm text-slate-700">
            {recentWork.map((entry, index) => (
              <li key={`simple-work-${index}`} className="entry flex flex-col gap-1">
                <span className="font-medium">{entry.title}</span>
                <span className="text-slate-600">{entry.start}〜{entry.end ?? "現在"}</span>
                {entry.detail ? <span className="text-slate-600">{entry.detail}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {pr?.generated ? (
        <section className="section avoid-break space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">自己PR（要点）</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{pr.generated}</p>
        </section>
      ) : null}

      {career?.generatedCareer ? (
        <section className="section avoid-break space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">職務経歴（要約）</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{career.generatedCareer}</p>
        </section>
      ) : null}
    </div>
  );
}
