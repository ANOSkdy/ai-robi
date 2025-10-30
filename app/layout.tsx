import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 履歴書・職務経歴書ジェネレーター',
  description: 'Gemini + DOCX テンプレで PDF/DOCX 生成',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="scroll-smooth">
      <body className="min-h-screen bg-bg text-fg antialiased">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-lg bg-fg/90"></div>
              <span className="font-semibold tracking-tight">AI Resume/CV Generator</span>
            </div>
            <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-fg">
              <Link className="hover:text-fg" href="/">
                Home
              </Link>
              <span className="pointer-events-none hover:text-fg opacity-50" aria-disabled>
                Docs
              </span>
              <span className="pointer-events-none hover:text-fg opacity-50" aria-disabled>
                Pricing
              </span>
            </nav>
          </div>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="border-t border-border/60 mt-8">
          <div className="container py-6 text-xs text-muted-fg">
            © {new Date().getFullYear()} AI Resume/CV Generator. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
