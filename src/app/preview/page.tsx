"use client";

import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";

import PrimaryButton from "@/components/ui/PrimaryButton";
import { useI18n } from "@/i18n/i18n";
import { useResumeStore } from "@/store/resume";
import { useTemplateStore } from "@/store/template";
import { formatYmd } from "@/lib/date/formatYmd";
import { getResumeTemplate, resumeTemplates } from "@/templates/registry";
import type { ResumeData, TemplateId } from "@/templates/types";
import { toResumeData } from "@/templates/toResumeData";

type TemplateErrorBoundaryProps = {
  children: ReactNode;
  onRetry: () => void;
};

type TemplateErrorBoundaryState = {
  hasError: boolean;
};

class TemplateErrorBoundary extends Component<TemplateErrorBoundaryProps, TemplateErrorBoundaryState> {
  state: TemplateErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): TemplateErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry();
  };

  private handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded border border-red-200 bg-white p-6 text-center text-sm text-red-700"
          role="alert"
        >
          <div className="space-y-2">
            <p className="font-semibold">プレビューを表示できませんでした。</p>
            <p className="text-xs text-red-600">入力内容を確認し、再試行してください。</p>
          </div>
          <div className="row flex flex-wrap justify-center gap-2">
            <button type="button" className="btn outline" onClick={this.handleRetry} aria-label="プレビューを再試行する">
              もう一度試す
            </button>
            <button type="button" className="btn" onClick={this.handleReload} aria-label="ページを再読み込みする">
              再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function PreviewPage() {
  const router = useRouter();
  const { t } = useI18n();
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
  const [renderAttempt, setRenderAttempt] = useState(0);
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

  useEffect(() => {
    setRenderAttempt(0);
  }, [templateId]);

  const documentTitle = useMemo(() => {
    const base = profile?.name ? `${profile.name}-resume` : "resume-preview";
    return `${base}-${formatYmd(new Date())}`;
  }, [profile?.name]);

  const triggerPrint = useReactToPrint({
    contentRef: printContentRef,
    documentTitle,
  });

  const handlePrint = useCallback(() => {
    if (!printContentRef.current) {
      return;
    }
    triggerPrint?.();
  }, [triggerPrint]);

  const handlePdfDownload = useCallback(() => {
    if (!printContentRef.current) {
      return;
    }
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

  const resumeData = toResumeData();

  const hasAnyContent = useMemo(() => hasResumeDataContent(resumeData), [resumeData]);

  const template = getResumeTemplate(templateId);

  const handleRetryPreview = useCallback(() => {
    setRenderAttempt((current) => current + 1);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <div className="container mx-auto w-full max-w-[820px] px-4 print:w-auto print:max-w-none print:px-0">
        <div className="card mb-4 flex flex-col gap-4 print:hidden" data-hide-on-print>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="row flex flex-wrap items-center gap-2">
              <label htmlFor="template-select" className="text-sm font-medium text-slate-700">
                {t("preview.template")}
              </label>
              <select
                id="template-select"
                className="border rounded px-3 py-2 text-sm text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                style={{ background: "#ffffff" }}
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
            <div className="row flex flex-wrap gap-2">
              <PrimaryButton
                className="btn primary !border-[var(--primary-color)] !bg-[var(--primary-color)] !text-white hover:!bg-[var(--primary-ink-color)]"
                onClick={handleShare}
                loading={isSharing}
                aria-label="共有リンクを発行する"
              >
                {t("share.create")}
              </PrimaryButton>
              <PrimaryButton
                className="btn primary !border-[var(--primary-color)] !bg-[var(--primary-color)] !text-white hover:!bg-[var(--primary-ink-color)]"
                onClick={handlePrint}
                aria-label="印刷プレビューを開く"
              >
                {t("preview.print")}
              </PrimaryButton>
              <PrimaryButton
                className="btn accent !border-[var(--accent-color-3)] !bg-[var(--accent-color-3)] !text-white hover:!bg-[#7d3fcc]"
                onClick={handlePdfDownload}
                aria-label="PDFとして保存する"
              >
                PDFダウンロード
              </PrimaryButton>
              <PrimaryButton
                className="btn outline !bg-white !text-[var(--ink-color)] hover:!bg-slate-100"
                onClick={handleBack}
                aria-label="入力画面に戻る"
              >
                戻る
              </PrimaryButton>
            </div>
          </div>

          {shareUrl ? (
            <div className="card rounded-lg border border-slate-200 bg-white p-4 shadow-sm" role="group" aria-labelledby="share-link-heading">
              <div className="space-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 sm:pr-4">
                  <h2 id="share-link-heading" className="text-sm font-semibold text-slate-900">
                    共有用リンク（7日後に失効）
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">URLを知っている相手のみが閲覧できます。編集やAI生成はできません。</p>
                </div>
                <div className="row flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <label className="sr-only" htmlFor="share-link-input">
                    共有用URL
                  </label>
                  <input
                    id="share-link-input"
                    value={shareUrl}
                    readOnly
                    className="border w-full flex-1 bg-slate-50 p-2 text-sm text-slate-700 rounded border-slate-300 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    aria-describedby="share-link-heading"
                  />
                  <PrimaryButton className="btn" onClick={handleCopyShareUrl} aria-label="共有URLをコピーする">
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
            <TemplateErrorBoundary key={`${template.id}-${renderAttempt}`} onRetry={handleRetryPreview}>
              {template.component(resumeData)}
            </TemplateErrorBoundary>
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

const textHasValue = (value?: string | null) => {
  if (!value) {
    return false;
  }
  return value.trim().length > 0;
};

export const hasResumeDataContent = (data: ResumeData) => {
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
