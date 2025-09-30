import "./globals.css";
import Link from "next/link";
import React from "react";
import { MainNavigation } from "@/components/ui/MainNavigation";

export const runtime = "nodejs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b bg-white/95 shadow-sm backdrop-blur">
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
        <main className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-4xl px-4 py-6 md:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
