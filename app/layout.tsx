import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 履歴書・職務経歴書ジェネレーター',
  description: 'Gemini + DOCX テンプレでPDF/Docx生成',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
