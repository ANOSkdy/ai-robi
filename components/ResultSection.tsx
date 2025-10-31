'use client';
import { useState } from 'react';
import type { ResumeFormData } from '@/lib/schema';

export default function ResultSection({ formData, onBack }: { formData: ResumeFormData; onBack: ()=>void }) {
  const [loading, setLoading] = useState<'resume'|'cv'|null>(null);
  const gen = async (doc: 'resume'|'cv') => {
    setLoading(doc);
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ formData, documentType: doc }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'PDF生成に失敗しました');
      const b64 = json.pdfBase64 as string;
      const bytes = Uint8Array.from(atob(b64), char => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'PDFエラー';
      alert(message);
    } finally {
      setLoading(null);
    }
  };
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onBack} type="button">← 入力に戻る</button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={() => gen('resume')} disabled={loading!==null}>{loading==='resume'?'生成中...':'履歴書PDFを生成'}</button>
        <button type="button" onClick={() => gen('cv')} disabled={loading!==null}>{loading==='cv'?'生成中...':'職務経歴書PDFを生成'}</button>
      </div>
      <p style={{ opacity:.7 }}>PDFは新しいタブで開きます。</p>
    </div>
  );
}

