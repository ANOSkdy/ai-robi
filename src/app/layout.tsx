export const runtime = "nodejs";
import Link from "next/link";
import React from "react";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="px-3 py-1 rounded hover:bg-gray-100 transition">
    {children}
  </Link>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-white text-black">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
          <nav className="max-w-5xl mx-auto flex flex-wrap gap-1 sm:gap-2 p-3 text-sm items-center">
            <Link href="/" className="font-semibold mr-2 px-2 py-1 rounded hover:bg-gray-100">AI-ROBI</Link>
            <NavLink href="/resume/profile">履歴書:プロフィール</NavLink>
            <NavLink href="/resume/history">学歴・職歴</NavLink>
            <NavLink href="/resume/pr">自己PR</NavLink>
            <NavLink href="/cv">職務経歴</NavLink>
            <NavLink href="/preview">プレビュー</NavLink>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}