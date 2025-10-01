import "./globals.css";
import "@/styles/globals.css";
import "@/styles/print.css";
import "@/styles/a11y.css";
import Link from "next/link";
import React from "react";
import LangSwitcher from "@/components/LangSwitcher";
import { I18nProvider } from "@/i18n/i18n";
import { MainNavigation } from "@/components/ui/MainNavigation";

export const runtime = "nodejs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-white text-slate-900">
        <I18nProvider>
          <a
            href="#main"
            className="sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-slate-900"
          >
            コンテンツへスキップ
          </a>
          <header
            className="app-hd"
            data-hide-on-print
            id="top"
            role="banner"
          >
            <div className="container flex items-center justify-between gap-4 py-4">
              <Link href="/" className="inline-flex items-center text-lg font-semibold tracking-tight text-slate-900">
                AI-ROBI
              </Link>
              <div className="flex items-center gap-3">
                <MainNavigation />
                <LangSwitcher />
              </div>
            </div>
          </header>
          <main id="main" role="main" className="app-shell">
            <div className="container py-6 md:py-10">{children}</div>
          </main>
          <footer className="sr-only" role="contentinfo">
            © AI-ROBI
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
