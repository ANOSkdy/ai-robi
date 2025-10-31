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
      const blob = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'PDFエラー');
    } finally {
      setLoading(null);
    }
  };
  return (
    <div className="eco-card" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onBack} type="button" className="eco-btn">← 入力に戻る</button>
      </div>
      <div className="eco-result-actions">
        <button type="button" className="eco-btn eco-btn-primary" onClick={() => gen('resume')} disabled={loading!==null}>{loading==='resume'?'生成中...':'履歴書PDFを生成'}</button>
        <button type="button" className="eco-btn eco-btn-primary" onClick={() => gen('cv')} disabled={loading!==null}>{loading==='cv'?'生成中...':'職務経歴書PDFを生成'}</button>
      </div>
      <p style={{ opacity:.7, margin: 0 }}>PDFは新しいタブで開きます。</p>
    </div>
  );
}
