import Link from "next/link";

export default function Page() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">AI-ROBI ドキュメント生成</h1>
        <p className="mt-2 text-sm text-slate-600">
          履歴書・職務経歴書の入力フォームに情報を登録し、AI補助でドキュメントを整えましょう。
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            href="/resume/profile"
          >
            履歴書を作成
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            href="/cv"
          >
            職務経歴書を作成
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            href="/preview"
          >
            プレビュー
          </Link>
        </div>
      </section>
      <section className="rounded-xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">作業の流れ</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>プロフィール、学歴・職歴・資格、自己PRを順に入力して保存します。</li>
          <li>必要に応じてAI生成を使い、自己PR文や職務経歴書の原稿を作成します。</li>
          <li>プレビュー画面で内容を確認し、次のステップ（PDF出力など）へ進みます。</li>
        </ol>
      </section>
    </div>
  );
}
