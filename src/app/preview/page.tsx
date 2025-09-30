"use client";

import Image from "next/image";
import { useResumeStore } from "@/store/resume";

export default function PreviewPage() {
  const { profile, education, employment, licenses, prText, cv, cvResult } = useResumeStore((state) => ({
    profile: state.profile,
    education: state.education,
    employment: state.employment,
    licenses: state.licenses,
    prText: state.prText,
    cv: state.cv,
    cvResult: state.cvResult,
  }));

  const hasResumeContent =
    profile.name || education.length > 0 || employment.length > 0 || licenses.length > 0 || prText;

  return (
    <div className="flex w-full justify-center overflow-x-auto py-4">
      <div className="w-full max-w-[794px] space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-semibold text-slate-900">プレビュー</h1>
          <p className="mt-1 text-sm text-slate-600">入力した内容を印刷レイアウトに近い形で確認できます。</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">履歴書</h2>
          {hasResumeContent ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 border border-slate-200 p-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">氏名</p>
                    <p className="text-lg font-semibold text-slate-900">{profile.name || "未入力"}</p>
                    {profile.nameKana ? <p className="text-sm text-slate-600">{profile.nameKana}</p> : null}
                  </div>
                  <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">生年月日</p>
                      <p>{profile.birth || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">電話番号</p>
                      <p>{profile.phone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">メール</p>
                      <p>{profile.email || "-"}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-slate-500">住所</p>
                      <p>{profile.address || "-"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex w-full max-w-[180px] items-center justify-center">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                    {profile.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt="プロフィール画像"
                        fill
                        className="object-cover"
                        sizes="180px"
                        unoptimized
                      />
                    ) : (
                      <p className="flex h-full items-center justify-center text-xs text-slate-500">写真なし</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900">学歴</h3>
                {education.length > 0 ? (
                  <ul className="space-y-2 text-sm text-slate-700">
                    {education.map((entry, index) => (
                      <li key={`education-${index}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium text-slate-800">{entry.school}</span>
                        <span className="text-slate-600">
                          {entry.start} 〜 {entry.end} ／ {entry.status}
                          {entry.degree ? `（${entry.degree}）` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">登録された学歴はありません。</p>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900">職歴</h3>
                {employment.length > 0 ? (
                  <ul className="space-y-2 text-sm text-slate-700">
                    {employment.map((entry, index) => (
                      <li key={`employment-${index}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium text-slate-800">{entry.company}</span>
                        <span className="text-slate-600">
                          {entry.start} 〜 {entry.end} ／ {entry.role} ／ {entry.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">登録された職歴はありません。</p>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900">資格・免許</h3>
                {licenses.length > 0 ? (
                  <ul className="space-y-1 text-sm text-slate-700">
                    {licenses.map((entry, index) => (
                      <li key={`license-${index}`}>
                        {entry.name}（取得：{entry.obtainedOn}）
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">登録された資格はありません。</p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-900">自己PR</h3>
                <p className="min-h-[80px] whitespace-pre-line rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {prText || "自己PR文はまだ生成されていません。"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">履歴書情報がまだ入力されていません。</p>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">職務経歴書</h2>
          {cv.experiences.length > 0 || cv.jobProfile.title || cvResult ? (
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">プロフィール</h3>
                <dl className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">氏名</dt>
                    <dd>{cv.jobProfile.name || profile.name || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">タイトル</dt>
                    <dd>{cv.jobProfile.title || "-"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">要約</dt>
                    <dd>{cv.jobProfile.summary || "-"}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900">経験</h3>
                {cv.experiences.length > 0 ? (
                  <div className="space-y-4">
                    {cv.experiences.map((experience, index) => (
                      <div key={`cv-experience-${index}`} className="rounded-lg border border-slate-200 p-4">
                        <h4 className="text-sm font-semibold text-slate-900">{experience.company}</h4>
                        <p className="text-sm text-slate-600">{experience.period} ／ {experience.role}</p>
                        {experience.achievements.length > 0 ? (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                            {experience.achievements.map((achievement, achievementIndex) => (
                              <li key={`achievement-${index}-${achievementIndex}`}>{achievement}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">職務経歴の入力はまだありません。</p>
                )}
              </div>

              {cvResult ? (
                <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">AI生成サマリー</h3>
                    <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{cvResult.summary}</p>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">AIが整理した経験</h3>
                    <div className="mt-2 space-y-3">
                      {cvResult.companies.map((company) => (
                        <div key={`${company.name}-${company.term}`} className="rounded-md border border-slate-200 p-3">
                          <h4 className="text-sm font-semibold text-slate-900">
                            {company.name}（{company.term}）
                          </h4>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                            {company.roles.map((role) => (
                              <li key={`cv-result-role-${company.name}-${role}`}>{role}</li>
                            ))}
                            {company.tasks.map((task) => (
                              <li key={`cv-result-task-${company.name}-${task}`}>{task}</li>
                            ))}
                            {company.achievements.map((achievement) => (
                              <li key={`cv-result-achievement-${company.name}-${achievement}`}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">AI提案：活かせる経験</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {cvResult.leverage.map((item) => (
                        <li key={`cv-result-leverage-${item.title}`}>
                          <span className="font-semibold">{item.title}：</span>
                          <span className="ml-1">{item.example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">AI生成 自己PR</h3>
                    <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{cvResult.selfPR}</p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-500">職務経歴書の情報がまだ入力されていません。</p>
          )}
        </section>
      </div>
    </div>
  );
}
