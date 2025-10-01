import "./globals.css";
import "@/styles/print.css";
import "@/styles/a11y.css";
import Link from "next/link";
import React from "react";
import { MainNavigation } from "@/components/ui/MainNavigation";

export const runtime = "nodejs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <a
          href="#main"
          className="sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-slate-900"
        >
          コンテンツへスキップ
        </a>
        <header className="border-b bg-white/95 shadow-sm backdrop-blur" data-hide-on-print id="top" role="banner">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <Link
              href="/"
              className="inline-flex items-center text-lg font-semibold tracking-tight text-slate-900"
            >
              AI-ROBI
            </Link>
            <MainNavigation />
          </div>
        </header>
        <main
          id="main"
          role="main"
          className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-4xl px-4 py-6 md:py-10"
        >
          {children}
        </main>
        <footer className="sr-only" role="contentinfo">
          © AI-ROBI
        </footer>
      </body>
    </html>
  );
}
