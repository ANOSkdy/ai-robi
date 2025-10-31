'use client';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export default function CvFields() {
  const { register, getValues, setValue } = useFormContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gen = async () => {
    setLoading(true); setError(null);
    const qs = getValues(['q1_cv','q2_cv','q3_cv','q4_cv','q5_cv']) as string[];
    const prompt = [
      'あなたは日本語のキャリアコンサルタントです。以下の回答を基に、職務経歴書の要約/詳細/スキル/自己PRをJSONで出力してください。',
      '必ず以下のJSONのみを返し、コードフェンスや解説は禁止：',
      '{"summary":"...", "details":"...", "skills":"...", "pr":"..."}',
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
      const text = String(json.aiText || '').trim();
      const parsed = JSON.parse(text);
      setValue('generated_cv_summary', parsed.summary || '');
      setValue('generated_cv_details', parsed.details || '');
      setValue('generated_cv_skills', parsed.skills || '');
      setValue('generated_cv_pr', parsed.pr || '');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'AIエラー（JSON）');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h3 style={{ margin: 0 }}>職務経歴書（入力 & AI生成）</h3>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display: 'grid', gap: 4 }}>
          <label>Q{i+1}</label>
          <textarea rows={3} {...register(`q${i+1}_cv` as const)} />
        </div>
      ))}
      <button type="button" onClick={gen} disabled={loading}>{loading ? '生成中...' : '職務経歴書をAI生成'}</button>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

      <div style={{ display: 'grid', gap: 6 }}>
        <label>要約</label>
        <textarea rows={4} {...register('generated_cv_summary')} />
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        <label>詳細</label>
        <textarea rows={6} {...register('generated_cv_details')} />
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        <label>スキル</label>
        <textarea rows={4} {...register('generated_cv_skills')} />
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        <label>自己PR</label>
        <textarea rows={6} {...register('generated_cv_pr')} />
      </div>
    </div>
  );
}

