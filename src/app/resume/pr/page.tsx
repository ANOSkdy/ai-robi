"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { FormSection } from "@/components/ui/FormSection";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useResumeStore } from "@/store/resume";
import { fetchJson, ApiError } from "@/lib/utils/fetchJson";

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

export default function ResumePrPage() {
  const { answers, setAnswer, prText, setPrText } = useResumeStore((state) => ({
    answers: state.prAnswers,
    setAnswer: state.setPrAnswer,
    prText: state.prText,
    setPrText: state.setPrText,
  }));

  const [fieldErrors, setFieldErrors] = useState<string[]>(Array(5).fill(""));
  const [errorMessage, setErrorMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const canCopy = typeof navigator !== "undefined" && navigator.clipboard !== undefined;

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setFieldErrors(Array(5).fill(""));

    const result = answersSchema.safeParse(answers.map((answer) => answer.trim()))
;
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

    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const handleGenerate = async () => {
    setGenerateError("");
    setIsGenerating(true);
    try {
      const payload = { answers: answers.map((answer) => answer.trim()) };
      answersSchema.parse(payload.answers);
      const data = await fetchJson<{ prText: string }>("/api/ai/generate-resume", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setPrText(data.prText ?? "");
    } catch (error) {
      if (error instanceof ApiError) {
        setGenerateError(error.message);
      } else {
        setGenerateError("AIの生成に失敗しました。時間を置いて再度お試しください。");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyResult = async () => {
    if (!prText) return;
    try {
      await navigator.clipboard.writeText(prText);
      setGenerateError("");
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setGenerateError("コピーに失敗しました。手動で選択してください。");
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSave} noValidate>
      <FormSection title="履歴書：自己PR" description="5つの質問に回答してください。">
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
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "生成中..." : "AIで生成"}
            </button>
            <Link
              href="/preview"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            >
              プレビューへ
            </Link>
          </div>
        </div>
        {generateError ? <ErrorBanner message={generateError} /> : null}
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
