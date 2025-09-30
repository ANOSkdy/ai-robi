"use client";

import { useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";

import PrimaryButton from "@/components/ui/PrimaryButton";
import { useResumeStore } from "@/store/resume";
import { formatYmd } from "@/lib/date/formatYmd";

export const displayValue = (value?: string | null) => {
  if (!value) {
    return "未入力";
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "未入力";
};

export default function PreviewPage() {
  const router = useRouter();
  const { profile, education, employment, licenses, prText, cv, cvResult } = useResumeStore((state) => ({
    profile: state.profile,
    education: state.education,
    employment: state.employment,
    licenses: state.licenses,
    prText: state.prText,
    cv: state.cv,
    cvResult: state.cvResult,
  }));
  const printContentRef = useRef<HTMLDivElement>(null);

  const documentTitle = useMemo(() => {
    const base = profile?.name ? `${profile.name}-resume` : "resume-preview";
    return `${base}-${formatYmd(new Date())}`;
  }, [profile?.name]);

  const triggerPrint = useReactToPrint({
    contentRef: printContentRef,
    documentTitle,
  });

  const handlePrint = useCallback(() => {
    triggerPrint?.();
  }, [triggerPrint]);

  const handlePdfDownload = useCallback(() => {
    triggerPrint?.();
  }, [triggerPrint]);

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  const hasResumeContent =
    displayValue(profile.name) !== "未入力" ||
    displayValue(profile.address) !== "未入力" ||
    displayValue(profile.phone) !== "未入力" ||
    displayValue(profile.email) !== "未入力" ||
    displayValue(profile.birth) !== "未入力" ||
    education.length > 0 ||
    employment.length > 0 ||
    licenses.length > 0 ||
    (prText?.trim()?.length ?? 0) > 0;

  const hasCvContent =
    displayValue(cv.jobProfile.name) !== "未入力" ||
    displayValue(cv.jobProfile.title) !== "未入力" ||
    displayValue(cv.jobProfile.summary) !== "未入力" ||
    cv.experiences.length > 0 ||
    Boolean(cvResult);

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto w-full max-w-[820px] px-4 print:w-auto print:max-w-none print:px-0">
        <div className="mb-4 flex justify-end gap-3 print:hidden" data-hide-on-print>
          <PrimaryButton onClick={handlePrint} aria-label="印刷プレビューを開く">
            印刷
          </PrimaryButton>
          <PrimaryButton onClick={handlePdfDownload} aria-label="PDFとして保存する">
            PDFダウンロード
          </PrimaryButton>
          <PrimaryButton onClick={handleBack} aria-label="入力画面に戻る">
            戻る
          </PrimaryButton>
        </div>

        <div
          ref={printContentRef}
          className="print-container print-body mx-auto w-[794px] space-y-8 bg-white p-10 text-black shadow print:w-full print:bg-white print:p-0 print:text-black"
        >
          <header className="avoid-break border-b pb-4">
            <h1 className="text-2xl font-semibold text-slate-900">履歴書・職務経歴書プレビュー</h1>
            <p className="mt-1 text-sm text-slate-600">入力した情報をA4レイアウトで確認できます。</p>
          </header>

          <section className="section avoid-break">
            <div className="mb-6 border-b pb-4">
              <h2 className="text-xl font-semibold text-slate-900">履歴書</h2>
            </div>
            {hasResumeContent ? (
              <div className="space-y-8 text-sm text-slate-800">
                <div className="avoid-break grid gap-6 md:grid-cols-[1fr_auto]">
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{displayValue(profile.name)}</p>
                      {profile.nameKana ? (
                        <p className="text-sm text-slate-600">{profile.nameKana}</p>
                      ) : null}
                    </div>
                    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-500">生年月日</dt>
                        <dd className="text-sm">{displayValue(profile.birth)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-500">電話番号</dt>
                        <dd className="text-sm">{displayValue(profile.phone)}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs uppercase tracking-wide text-slate-500">メール</dt>
                        <dd className="text-sm">{displayValue(profile.email)}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs uppercase tracking-wide text-slate-500">住所</dt>
                        <dd className="text-sm">{displayValue(profile.address)}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex w-full justify-end">
                    <div className="photo-4x3 relative aspect-[4/3] w-full max-w-[160px] overflow-hidden rounded-md border border-slate-200 bg-slate-200">
                      {profile.avatarUrl ? (
                        <Image
                          src={profile.avatarUrl}
                          alt="プロフィール画像"
                          fill
                          className="object-cover"
                          sizes="160px"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">No Image</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="avoid-break space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">学歴</h3>
                  {education.length > 0 ? (
                    <ul className="space-y-3">
                      {education.map((entry, index) => (
                        <li
                          key={`education-${index}`}
                          className="entry avoid-break flex flex-col gap-1 md:flex-row md:items-center md:justify-between"
                        >
                          <span className="font-medium text-slate-900">{displayValue(entry.school)}</span>
                          <span className="text-slate-600">
                            {displayValue(entry.start)} 〜 {displayValue(entry.end)} ／ {displayValue(entry.status)}
                            {entry.degree ? `（${entry.degree}）` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500">未入力</p>
                  )}
                </div>

                <div className="avoid-break space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">職歴</h3>
                  {employment.length > 0 ? (
                    <ul className="space-y-3">
                      {employment.map((entry, index) => (
                        <li
                          key={`employment-${index}`}
                          className="entry avoid-break flex flex-col gap-1 md:flex-row md:items-center md:justify-between"
                        >
                          <span className="font-medium text-slate-900">{displayValue(entry.company)}</span>
                          <span className="text-slate-600">
                            {displayValue(entry.start)} 〜 {displayValue(entry.end)} ／ {displayValue(entry.role)} ／ {displayValue(entry.status)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500">未入力</p>
                  )}
                </div>

                <div className="avoid-break space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">資格・免許</h3>
                  {licenses.length > 0 ? (
                    <ul className="space-y-2">
                      {licenses.map((entry, index) => (
                        <li
                          key={`license-${index}`}
                          className="entry avoid-break flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="font-medium text-slate-900">{displayValue(entry.name)}</span>
                          <span className="text-slate-600">取得：{displayValue(entry.obtainedOn)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500">未入力</p>
                  )}
                </div>

                <div className="avoid-break space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900">自己PR</h3>
                  <p className="min-h-[120px] whitespace-pre-line rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                    {prText?.trim() ? prText : "未入力"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">履歴書情報がまだ入力されていません。</p>
            )}
          </section>

          <section className="section avoid-break">
            <div className="mb-6 border-b pb-4">
              <h2 className="text-xl font-semibold text-slate-900">職務経歴書</h2>
            </div>
            {hasCvContent ? (
              <div className="space-y-8 text-sm text-slate-800">
                <div className="avoid-break space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900">職務プロフィール</h3>
                  <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-slate-500">氏名</dt>
                      <dd>{displayValue(cv.jobProfile.name) !== "未入力" ? cv.jobProfile.name : displayValue(profile.name)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-slate-500">タイトル</dt>
                      <dd>{displayValue(cv.jobProfile.title)}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs uppercase tracking-wide text-slate-500">要約</dt>
                      <dd>{displayValue(cv.jobProfile.summary)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="avoid-break space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">経験</h3>
                  {cv.experiences.length > 0 ? (
                    <div className="space-y-6">
                      {cv.experiences.map((experience, index) => (
                        <div key={`cv-experience-${index}`} className="entry avoid-break space-y-3">
                          <div className="avoid-break border-b pb-2">
                            <h4 className="text-base font-semibold text-slate-900">{displayValue(experience.company)}</h4>
                            <p className="text-sm text-slate-600">
                              {displayValue(experience.period)} ／ {displayValue(experience.role)}
                            </p>
                          </div>
                          {experience.achievements.length > 0 ? (
                            <ul className="list-disc space-y-2 pl-5">
                              {experience.achievements.map((achievement, achievementIndex) => (
                                <li key={`achievement-${index}-${achievementIndex}`} className="avoid-break text-slate-700">
                                  {displayValue(achievement)}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-500">未入力</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">未入力</p>
                  )}
                </div>

                {cvResult ? (
                  <div className="card avoid-break space-y-6 rounded-md border border-slate-200 p-6">
                    <div className="avoid-break space-y-3">
                      <h3 className="text-lg font-semibold text-slate-900">AI生成サマリー</h3>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{displayValue(cvResult.summary)}</p>
                    </div>
                    <div className="avoid-break space-y-3">
                      <h3 className="text-lg font-semibold text-slate-900">AIが整理した経験</h3>
                      <div className="space-y-4">
                        {cvResult.companies.map((company) => (
                          <div key={`${company.name}-${company.term}`} className="card avoid-break rounded border border-slate-200 p-4">
                            <h4 className="text-base font-semibold text-slate-900">
                              {displayValue(company.name)}（{displayValue(company.term)}）
                            </h4>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
                              {company.roles.map((role) => (
                                <li key={`cv-result-role-${company.name}-${role}`} className="avoid-break">
                                  {displayValue(role)}
                                </li>
                              ))}
                              {company.tasks.map((task) => (
                                <li key={`cv-result-task-${company.name}-${task}`} className="avoid-break">
                                  {displayValue(task)}
                                </li>
                              ))}
                              {company.achievements.map((achievement) => (
                                <li key={`cv-result-achievement-${company.name}-${achievement}`} className="avoid-break">
                                  {displayValue(achievement)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="avoid-break space-y-3">
                      <h3 className="text-lg font-semibold text-slate-900">AI提案：活かせる経験</h3>
                      <ul className="list-disc space-y-2 pl-5 text-slate-700">
                        {cvResult.leverage.map((item) => (
                          <li key={`cv-result-leverage-${item.title}`} className="avoid-break">
                            <span className="font-semibold">{displayValue(item.title)}：</span>
                            <span className="ml-1">{displayValue(item.example)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="avoid-break space-y-3">
                      <h3 className="text-lg font-semibold text-slate-900">AI生成 自己PR</h3>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{displayValue(cvResult.selfPR)}</p>
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
    </div>
  );
}
