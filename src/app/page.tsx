"use client";

import Link from "next/link";

import { useI18n } from "@/i18n/i18n";

export default function Page() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <section className="hero">
        <h1 className="h1">{t("app.title")}</h1>
        <p className="lead mb-3">
          履歴書・職務経歴書の入力フォームに情報を登録し、AI補助でドキュメントを整えましょう。
        </p>
        <div className="row mt-3 flex-wrap">
          <Link className="btn primary" href="/resume/profile">
            履歴書を作成
          </Link>
          <Link className="btn outline" href="/cv">
            職務経歴書を作成
          </Link>
          <Link className="btn outline" href="/preview">
            プレビュー
          </Link>
        </div>
      </section>
      <section className="card">
        <h2 className="h2">{t("home.flow.title")}</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li className="mt-2">{t("home.flow.1")}</li>
          <li className="mt-2">{t("home.flow.2")}</li>
          <li className="mt-2">{t("home.flow.3")}</li>
        </ol>
      </section>
    </div>
  );
}
