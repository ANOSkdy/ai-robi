"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";

import PrimaryButton from "@/components/ui/PrimaryButton";
import { useResumeStore } from "@/store/resume";
import { useTemplateStore } from "@/store/template";
import { formatYmd } from "@/lib/date/formatYmd";
import { getResumeTemplate, resumeTemplates } from "@/templates/registry";
import type { ResumeData, TemplateId } from "@/templates/types";

export default function PreviewPage() {
  const router = useRouter();
  const { profile, education, employment, licenses, prText, prAnswers, cv, cvText } = useResumeStore((state) => ({
    profile: state.profile,
    education: state.education,
    employment: state.employment,
    licenses: state.licenses,
    prText: state.prText,
    prAnswers: state.prAnswers,
    cv: state.cv,
    cvText: state.cvText,
  }));
  const printContentRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const templateId = useTemplateStore((state) => state.template);
  const setTemplate = useTemplateStore((state) => state.setTemplate);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

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

  const copyToClipboard = useCallback(async (value: string) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(value);
      return true;
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (isSharing) {
      return;
    }

    setIsSharing(true);

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId,
          resume: {
            profile,
            education,
            employment,
            licenses,
            prText,
          },
          career: {
            cv,
            cvText,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create share link");
      }

      const json = (await response.json()) as { url?: string };
      if (!json.url) {
        throw new Error("Invalid response");
      }

      setShareUrl(json.url);
      const copied = await copyToClipboard(json.url);
      showToast(copied ? "共有URLをコピーしました" : "共有URLをコピーできませんでした");
    } catch (error) {
      showToast("共有URLの発行に失敗しました");
    } finally {
      setIsSharing(false);
    }
  }, [
    copyToClipboard,
    cv,
    cvText,
    education,
    employment,
    isSharing,
    licenses,
    prText,
    profile,
    showToast,
    templateId,
  ]);

  const handleCopyShareUrl = useCallback(async () => {
    if (!shareUrl) {
      return;
    }

    const copied = await copyToClipboard(shareUrl);
    showToast(copied ? "共有URLをコピーしました" : "共有URLをコピーできませんでした");
  }, [copyToClipboard, shareUrl, showToast]);

  const resumeData = useMemo(
    () =>
      buildResumeData({
        profile,
        education,
        employment,
        licenses,
        prText,
        prAnswers,
        cvText,
        cv,
      }),
    [profile, education, employment, licenses, prText, prAnswers, cvText, cv],
  );

  const hasAnyContent = useMemo(() => hasResumeDataContent(resumeData), [resumeData]);

  const template = getResumeTemplate(templateId);

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto w-full max-w-[820px] px-4 print:w-auto print:max-w-none print:px-0">
        <div className="mb-4 flex flex-col gap-4 print:hidden" data-hide-on-print>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="template-select" className="text-sm font-medium text-slate-700">
                テンプレート
              </label>
              <select
                id="template-select"
                className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                value={templateId}
                onChange={(event) => setTemplate(event.target.value as TemplateId)}
              >
                {resumeTemplates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <PrimaryButton onClick={handleShare} loading={isSharing} aria-label="共有リンクを発行する">
              共有リンクを発行
            </PrimaryButton>
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

          {shareUrl ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" role="group" aria-labelledby="share-link-heading">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 sm:pr-4">
                  <h2 id="share-link-heading" className="text-sm font-semibold text-slate-900">
                    共有用リンク（7日後に失効）
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">URLを知っている相手のみが閲覧できます。編集やAI生成はできません。</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <label className="sr-only" htmlFor="share-link-input">
                    共有用URL
                  </label>
                  <input
                    id="share-link-input"
                    value={shareUrl}
                    readOnly
                    className="w-full flex-1 rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    aria-describedby="share-link-heading"
                  />
                  <PrimaryButton onClick={handleCopyShareUrl} aria-label="共有URLをコピーする">
                    コピー
                  </PrimaryButton>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div
          ref={printContentRef}
          className="print-container mx-auto w-[794px] bg-white p-10 text-black shadow print:w-full print:bg-white print:p-0 print:text-black"
        >
          {hasAnyContent ? (
            template.component(resumeData)
          ) : (
            <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-500">
              履歴書・職務経歴書の内容がまだ入力されていません。
            </div>
          )}
        </div>
      </div>
      {toastMessage ? (
        <div
          className="fixed bottom-4 left-1/2 z-50 w-[min(90vw,320px)] -translate-x-1/2 rounded-md bg-slate-900 px-4 py-3 text-center text-sm text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          {toastMessage}
        </div>
      ) : null}
    </div>
  );
}

type BuildResumeDataParams = {
  profile: ReturnType<typeof useResumeStore.getState>["profile"];
  education: ReturnType<typeof useResumeStore.getState>["education"];
  employment: ReturnType<typeof useResumeStore.getState>["employment"];
  licenses: ReturnType<typeof useResumeStore.getState>["licenses"];
  prText: ReturnType<typeof useResumeStore.getState>["prText"];
  prAnswers: ReturnType<typeof useResumeStore.getState>["prAnswers"];
  cvText: ReturnType<typeof useResumeStore.getState>["cvText"];
  cv: ReturnType<typeof useResumeStore.getState>["cv"];
};

const textHasValue = (value?: string | null) => {
  if (!value) {
    return false;
  }
  return value.trim().length > 0;
};

const buildResumeData = ({
  profile,
  education,
  employment,
  licenses,
  prText,
  prAnswers,
  cvText,
  cv,
}: BuildResumeDataParams): ResumeData => {
  const trimmedPrText = prText.trim();
  const filteredAnswers = prAnswers.map((answer) => answer.trim()).filter((answer) => answer.length > 0);
  const prData =
    trimmedPrText.length > 0 || filteredAnswers.length > 0
      ? {
          generated: trimmedPrText.length > 0 ? trimmedPrText : undefined,
          answers: filteredAnswers.length > 0 ? filteredAnswers : undefined,
        }
      : undefined;

  const combinedCareerText = (() => {
    const explicitCvText = cvText.trim();
    if (explicitCvText.length > 0) {
      return explicitCvText;
    }

    const jobProfileParts = [
      cv.jobProfile.name ? `氏名: ${cv.jobProfile.name}` : null,
      cv.jobProfile.title ? `タイトル: ${cv.jobProfile.title}` : null,
      cv.jobProfile.summary ? `要約: ${cv.jobProfile.summary}` : null,
    ].filter((part): part is string => part !== null);

    const experienceParts = cv.experiences
      .map((experience) => {
        const achievements = experience.achievements
          .map((achievement) => achievement.trim())
          .filter((achievement) => achievement.length > 0);
        const achievementText = achievements.length > 0 ? `\n・${achievements.join("\n・")}` : "";
        const period = experience.period ? `${experience.period}` : "";
        const role = experience.role ? `／${experience.role}` : "";
        return `${period} ${experience.company}${role}${achievementText}`.trim();
      })
      .filter((entry) => entry.length > 0);

    const sections = [...jobProfileParts, ...experienceParts];
    if (sections.length === 0) {
      return undefined;
    }
    return sections.join("\n\n");
  })();

  return {
    profile: {
      name: profile.name,
      nameKana: profile.nameKana || undefined,
      birth: textHasValue(profile.birth) ? profile.birth : undefined,
      address: profile.address,
      phone: profile.phone,
      email: profile.email,
      avatarUrl: profile.avatarUrl || undefined,
    },
    education: education.map((entry) => ({
      start: entry.start,
      end: entry.end || undefined,
      title: entry.school,
      detail: entry.degree || undefined,
      status: entry.status,
    })),
    work: employment.map((entry) => ({
      start: entry.start,
      end: entry.end || undefined,
      title: entry.company,
      detail: entry.role,
      status: entry.status,
    })),
    licenses: licenses.map((entry) => ({
      name: entry.name,
      acquiredOn: entry.obtainedOn || undefined,
    })),
    pr: prData,
    career: combinedCareerText ? { generatedCareer: combinedCareerText } : undefined,
  };
};

const hasResumeDataContent = (data: ResumeData) => {
  if (textHasValue(data.profile.name) || textHasValue(data.profile.address) || textHasValue(data.profile.email)) {
    return true;
  }

  if (data.education.length > 0 || data.work.length > 0 || data.licenses.length > 0) {
    return true;
  }

  if (data.pr && (textHasValue(data.pr.generated) || (data.pr.answers?.length ?? 0) > 0)) {
    return true;
  }

  if (data.career && textHasValue(data.career.generatedCareer)) {
    return true;
  }

  return false;
};
