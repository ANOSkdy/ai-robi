"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { FormSection } from "@/components/ui/FormSection";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useResumeStore } from "@/store/resume";
import { zResumeForm } from "@/lib/validate/zod";
import AIGeneratePanel from "@/components/AIGeneratePanel";

const answersSchema = z
  .array(z.string().trim().min(1, "回答を入力してください。"))
  .length(5, "5つの質問すべてに回答してください。");

const QUESTIONS = [
  "1) 強み・得意分野は？",
  "2) 代表的な成果/実績は？（数値あれば）",
  "3) チームでの役割と貢献は？",
  "4) 今後活かしたい経験・スキルは？",
  "5) 志望動機の核は？",
];

const SECTION_LABELS: Record<string, string> = {
  profile: "プロフィール",
  education: "学歴",
  work: "職歴",
  licenses: "資格・免許",
  pr: "自己PR",
};

type ResumePayload = z.infer<typeof zResumeForm>;

export default function ResumePrPage() {
  const router = useRouter();
  const { answers, setAnswer, prText, setPrText, profile, education, employment, licenses } = useResumeStore((state) => ({
    answers: state.prAnswers,
    setAnswer: state.setPrAnswer,
    prText: state.prText,
    setPrText: state.setPrText,
    profile: state.profile,
    education: state.education,
    employment: state.employment,
    licenses: state.licenses,
  }));

  const [fieldErrors, setFieldErrors] = useState<string[]>(Array(5).fill(""));
  const [errorMessage, setErrorMessage] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copyError, setCopyError] = useState("");
  const canCopy = typeof navigator !== "undefined" && navigator.clipboard !== undefined;

  const resumePayload = useMemo(() => {
    const trimmedAnswers = answers.map((answer) => answer.trim());

    return {
      profile: {
        name: profile.name?.trim() ?? "",
        birthday: profile.birth?.trim() ?? "",
        address: profile.address?.trim() ?? "",
        phone: profile.phone?.trim() ?? "",
        email: profile.email?.trim() ?? "",
        photoUrl: profile.avatarUrl?.trim() ?? "",
      },
      education: education.map((entry) => ({
        start: entry.start?.trim() ?? "",
        end: entry.end?.trim() ? entry.end.trim() : undefined,
        title: entry.school?.trim() ?? "",
        detail: entry.degree?.trim() ? entry.degree.trim() : undefined,
        status: entry.status === "中退" ? "中途退学" : entry.status,
      })),
      work: employment.map((entry) => ({
        start: entry.start?.trim() ?? "",
        end: entry.end?.trim() ? entry.end.trim() : undefined,
        title: entry.company?.trim() ?? "",
        detail: entry.role?.trim() ? entry.role.trim() : undefined,
        status: entry.status,
      })),
      licenses: licenses.map((entry) => ({
        name: entry.name?.trim() ?? "",
        acquiredOn: entry.obtainedOn?.trim() ? entry.obtainedOn.trim() : undefined,
      })),
      pr: {
        answers: trimmedAnswers,
        generated: prText?.trim() ? prText : undefined,
      },
    } satisfies ResumePayload;
  }, [answers, education, employment, licenses, prText, profile]);

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setFieldErrors(Array(5).fill(""));

    const result = answersSchema.safeParse(answers.map((answer) => answer.trim()));
    if (!result.success) {
      const nextErrors = Array(5).fill("");
      result.error.issues.forEach((issue) => {
        const index = issue.path[0] as number;
        if (typeof index === "number") {
          nextErrors[index] = issue.message;
        }
      });
      setFieldErrors(nextErrors);
      setErrorMessage("未入力の質問があります。すべて回答してください。");
      return;
    }

    setPreviewError("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const handlePreview = () => {
    const result = zResumeForm.safeParse(resumePayload);

    if (!result.success) {
      const issues = result.error.issues;
      const firstSectionKey = issues[0]?.path?.[0];
      const sectionLabel = typeof firstSectionKey === "string" ? SECTION_LABELS[firstSectionKey] ?? "フォーム" : "フォーム";
      setPreviewError(`未入力の必須項目が${issues.length}件あります。${sectionLabel}を確認してください。`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setPreviewError("");
    router.push("/preview");
  };

  const copyResult = async () => {
    if (!prText) return;
    try {
      await navigator.clipboard.writeText(prText);
      setCopyError("");
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setCopyError("コピーに失敗しました。手動で選択してください。");
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSave} noValidate>
      <FormSection title="履歴書：自己PR" description="5つの質問に回答してください。">
        {previewError ? <ErrorBanner message={previewError} /> : null}
        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
        <div className="space-y-6">
          {QUESTIONS.map((question, index) => (
            <div key={question} className="flex flex-col gap-2">
              <label htmlFor={`pr-answer-${index}`} className="text-sm font-medium text-slate-800">
                {question}
              </label>
              <textarea
                id={`pr-answer-${index}`}
                value={answers[index] ?? ""}
                onChange={(event) => setAnswer(index, event.target.value)}
                className={`min-h-[120px] rounded-md border px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                  fieldErrors[index] ? "border-red-400" : "border-slate-200"
                }`}
                aria-invalid={fieldErrors[index] ? "true" : undefined}
              />
              {fieldErrors[index] ? <p className="text-xs text-red-600">{fieldErrors[index]}</p> : null}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              保存する
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
              aria-label="プレビュー画面へ移動する"
            >
              プレビューへ
            </button>
          </div>
        </div>
        <AIGeneratePanel
          endpoint="/api/ai/generate-resume"
          payload={{ answers: answers.map((answer) => answer.trim()) }}
          onApply={(text) => {
            setPrText(text);
            setCopyError("");
          }}
          buttonLabel="AIで自己PR生成"
        />
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">生成された自己PR</h3>
            {canCopy ? (
              <button
                type="button"
                onClick={copyResult}
                className="text-sm font-medium text-slate-700 underline transition hover:text-slate-900"
              >
                コピー
              </button>
            ) : null}
          </div>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{prText || "まだ生成結果はありません。"}</p>
          {copyError ? <p className="pt-2 text-xs text-red-600">{copyError}</p> : null}
        </div>
      </FormSection>
      {saved ? (
        <div className="fixed bottom-6 right-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          保存しました
        </div>
      ) : null}
    </form>
  );
}
