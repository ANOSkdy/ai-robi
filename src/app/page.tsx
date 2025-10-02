"use client";

import Link from "next/link";

import DecorDots from "@/components/brand/DecorDots";
import DecorWave from "@/components/brand/DecorWave";
import FlatBarChart from "@/components/brand/FlatBarChart";
import FlatDonutChart from "@/components/brand/FlatDonutChart";
import PersonIllustration from "@/components/brand/PersonIllustration";
import { useI18n } from "@/i18n/i18n";

export default function Page() {
  const { t } = useI18n();
  const flowSteps = [t("home.flow.1"), t("home.flow.2"), t("home.flow.3")];

  return (
    <div className="space-y-6">
      <section className="hero fade-in">
        <DecorWave />
        <div className="relative flex flex-col-reverse items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <span className="tag">AI アシスト</span>
            <h1 className="h1">{t("app.title")}</h1>
            <p className="lead ink-muted">
              履歴書・職務経歴書の入力フォームに情報を登録し、AI補助でドキュメントを整えましょう。
            </p>
            <div className="row mt-3 flex-wrap">
              <Link className="btn primary" href="/resume/profile">
                履歴書を作成
              </Link>
              <Link className="btn accent" href="/preview">
                プレビュー
              </Link>
              <Link className="btn outline" href="/cv">
                職務経歴書を作成
              </Link>
            </div>
          </div>
          <div className="relative flex w-full justify-center md:w-auto">
            <div className="absolute -top-8 -right-8 hidden md:block">
              <DecorDots />
            </div>
            <PersonIllustration size={160} />
          </div>
        </div>
      </section>
      <section className="section">
        <h2 className="h2">{t("home.flow.title")}</h2>
        <ol
          className="mt-4 flex flex-col gap-4 md:flex-row md:items-center"
          aria-label={t("home.flow.title")}
        >
          {flowSteps.map((step, index) => (
            <li key={step} className="flex items-center gap-3">
              <span className="chip font-semibold">{index + 1}</span>
              <span className="text-sm text-slate-800 md:text-base">{step}</span>
              {index < flowSteps.length - 1 ? (
                <svg
                  className="hidden h-3 w-10 text-slate-300 md:block"
                  viewBox="0 0 48 12"
                  role="presentation"
                  aria-hidden="true"
                >
                  <path d="M0 6h44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M44 2l4 4-4 4" fill="currentColor" />
                </svg>
              ) : null}
            </li>
          ))}
        </ol>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="section">
            <div className="accent-bar mb-3" />
            <h3 className="h2">進捗</h3>
            <FlatDonutChart value={68} label="履歴書作成の進捗" />
          </div>
          <div className="section">
            <div className="accent-bar mb-3" />
            <h3 className="h2">入力項目</h3>
            <FlatBarChart data={[50, 80, 40, 70]} label="入力項目の充足率" />
          </div>
        </div>
        <div className="mt-6">
          <DecorDots />
        </div>
      </section>
    </div>
  );
}
