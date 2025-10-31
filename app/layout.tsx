import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import './resume/theme.css';

export const metadata: Metadata = {
  title: 'AI 履歴書・職務経歴書ジェネレーター',
  description: 'Gemini + DOCX テンプレで PDF/DOCX 生成',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="scroll-smooth bg-brand-light">
      <body className="min-h-screen bg-transparent text-fg antialiased">
        <div className="relative min-h-screen overflow-hidden">
          <span className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-green2/10 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-52 left-0 h-96 w-96 -translate-x-1/3 rotate-6 rounded-full bg-brand-earth1/10 blur-3xl" />
          <header className="relative z-20 border-b border-brand-green2/20 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-16 items-center justify-between">
              <Link href="/" className="group inline-flex items-center gap-3">
                <span className="leaf-clip-a relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-green1/80 to-brand-green2/60 text-white shadow-lg">
                  <span className="leaf-clip-b absolute inset-1 bg-white/30" aria-hidden />
                  <span className="relative text-xs font-semibold tracking-[0.24em]">AI</span>
                </span>
                <span className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-green1">Resume Studio</span>
              </Link>
              <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.3em] text-brand-earth2/80 sm:flex">
                <Link className="transition-colors hover:text-brand-green1" href="/resume">
                  履歴書ウィザード
                </Link>
                <Link className="transition-colors hover:text-brand-green1" href="/work-history">
                  職務経歴書ウィザード
                </Link>
                <a className="pointer-events-none opacity-40" aria-disabled href="#">
                  Docs
                </a>
              </nav>
            </div>
          </header>
          <main className="relative z-10 container py-10 sm:py-16">{children}</main>
          <footer className="relative z-10 border-t border-brand-green2/20 bg-white/70 backdrop-blur">
            <div className="container flex flex-col gap-3 py-6 text-xs text-brand-earth2/80 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} AI Resume/CV Generator. All rights reserved.</p>
              <p>Design palette: greens, earth, and recycled light.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
