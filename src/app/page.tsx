"use client";

import Link from "next/link";

import { useI18n } from "@/i18n/i18n";

export default function Page() {
  const { t } = useI18n();
  const headingId = "home-hero-heading";

  return (
    <div className="space-y-6">
      <section className="hero fade-in" aria-labelledby={headingId}>
        <span className="tag">AI アシスト</span>
        <h1 className="h1" id={headingId}>
          {t("app.title")}
        </h1>
        <p className="lead ink-muted">
          履歴書・職務経歴書の入力フォームに情報を登録し、AI補助でドキュメントを整えましょう。
        </p>
        <div className="row mt-3 flex-wrap">
          <Link className="btn primary" href="/resume/profile">
            {t("home.cta.resume")}
          </Link>
          <Link className="btn outline" href="/cv">
            {t("home.cta.career")}
          </Link>
        </div>
      </section>
    </div>
  );
}
