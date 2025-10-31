'use client';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export default function AiResumePr() {
  const { register, getValues, setValue } = useFormContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true); setError(null);
    const qs = getValues(['q1_resume','q2_resume','q3_resume','q4_resume','q5_resume']) as string[];
    const prompt = [
      'あなたは日本語の人事担当者です。以下の設問回答を踏まえ、履歴書の自己PRを400〜600字で日本語で作成してください。',
      '・読み手に伝わる簡潔な構成（結論→具体例→貢献）',
      '・です/ます調、抽象語を避け、成果と再現性を強調',
      '',
      '【回答】',
      `Q1: ${qs[0] ?? ''}`,
      `Q2: ${qs[1] ?? ''}`,
      `Q3: ${qs[2] ?? ''}`,
      `Q4: ${qs[3] ?? ''}`,
      `Q5: ${qs[4] ?? ''}`,
    ].join('\n');
    try {
      const res = await fetch('/api/generate-ai', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ prompt }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'AI生成に失敗しました');
      setValue('generated_resume_pr', json.aiText || '');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'AIエラー');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <h3 style={{ marginBottom: 4 }}>AI自己PR生成</h3>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display: 'grid', gap: 4 }}>
          <label>Q{i+1}</label>
          <textarea rows={3} {...register(`q${i+1}_resume` as const)} />
        </div>
      ))}
      <button type="button" onClick={handleGenerate} disabled={loading}>{loading ? '生成中...' : '自己PRを生成'}</button>
      <div style={{ display: 'grid', gap: 4 }}>
        <label>生成結果（自己PR）</label>
        <textarea rows={8} {...register('generated_resume_pr')} />
      </div>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
    </div>
  );
}

