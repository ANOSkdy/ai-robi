export const runtime = "nodejs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-white text-black">
        <header className="border-b">
          <nav className="max-w-5xl mx-auto flex gap-4 p-3 text-sm">
            <a href="/" className="font-semibold">AI-ROBI</a>
            <a href="/resume/profile">履歴書:プロフィール</a>
            <a href="/resume/history">履歴書:学歴・職歴</a>
            <a href="/resume/pr">履歴書:自己PR</a>
            <a href="/cv">職務経歴</a>
            <a href="/preview">プレビュー</a>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
