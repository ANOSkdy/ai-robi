import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import SkipLink from '@/components/a11y/SkipLink';
import BackdropPattern from '@/components/deco/BackdropPattern';
import TransitionProvider from '@/components/TransitionProvider';
import './resume/theme.css';

export const metadata: Metadata = {
  title: 'AI 履歴書・職務経歴書ジェネレーター',
  description: 'Gemini + DOCX テンプレで PDF/DOCX 生成',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="scroll-smooth bg-brand-light">
      <body className="min-h-screen bg-transparent text-fg antialiased">
        <SkipLink />
        <div className="relative min-h-screen overflow-hidden">
          <BackdropPattern />
          <span className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-52 left-0 h-96 w-96 -translate-x-1/3 rotate-6 rounded-full bg-accent1/10 blur-3xl" />
          <header className="relative z-20 border-b border-black/5 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto flex h-16 w-full max-w-screen-md items-center justify-between px-4 sm:px-6">
              <Link href="/" className="group inline-flex items-center gap-3" aria-label="AI Resume Studio ホームへ戻る">
                <span className="leaf-clip-a relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-green1/80 to-brand-green2/60 text-white shadow-lg">
                  <span className="leaf-clip-b absolute inset-1 bg-white/30" aria-hidden />
                  <span className="relative text-xs font-semibold tracking-[0.24em]">AI</span>
                </span>
                <span className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-green1">Resume Studio</span>
              </Link>
              <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.3em] text-gray-600 sm:flex" aria-label="主要ナビゲーション">
                <Link className="transition-colors hover:text-primary" href="/resume">
                  履歴書ウィザード
                </Link>
                <Link className="transition-colors hover:text-primary" href="/work-history">
                  職務経歴書ウィザード
                </Link>
                <a className="pointer-events-none opacity-40" aria-disabled href="#">
                  Docs
                </a>
              </nav>
            </div>
          </header>
          <main id="content" className="relative z-10 mx-auto w-full max-w-screen-md px-4 py-10 sm:px-6 sm:py-16">
            <TransitionProvider>{children}</TransitionProvider>
          </main>
          <footer className="relative z-10 border-t border-black/5 bg-white/70 backdrop-blur">
            <div className="mx-auto flex w-full max-w-screen-md flex-col gap-3 px-4 py-6 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p>© {new Date().getFullYear()} AI Resume/CV Generator. All rights reserved.</p>
              <p>Design palette: greens, earth, and calm blues.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
