'use client';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useOverlay } from './OverlayProvider';

export default function CvFields() {
  const { register, getValues, setValue, watch } = useFormContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlay = useOverlay();

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
      overlay.show('AIが職務経歴書を生成中です…');
      const res = await fetch('/api/generate-ai', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ prompt }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'AI生成に失敗しました');
      const raw = String(json.aiText || '').trim();
      const fence = raw.match(/```json\s*([\s\S]*?)\s*```/i);
      const text = fence ? fence[1] : raw;
      const parsed = JSON.parse(text);
      setValue('generated_cv_summary', parsed.summary || '');
      setValue('generated_cv_details', parsed.details || '');
      setValue('generated_cv_skills', parsed.skills || '');
      setValue('generated_cv_pr', parsed.pr || '');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'AIエラー（JSON）');
    } finally {
      setLoading(false);
      overlay.hide();
    }
  };

  const summary = watch('generated_cv_summary') as string | undefined;
  const details = watch('generated_cv_details') as string | undefined;
  const skills = watch('generated_cv_skills') as string | undefined;
  const pr = watch('generated_cv_pr') as string | undefined;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h3 className="eco-h3" style={{ margin: 0 }}>職務経歴書（入力 & AI生成）</h3>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="eco-col">
          <label className="eco-label">Q{i+1}</label>
          <textarea rows={3} {...register(`q${i+1}_cv` as const)} />
        </div>
      ))}
      <button type="button" className="eco-btn eco-btn-primary" onClick={gen} disabled={loading}>
        {loading ? '生成中...' : '職務経歴書をAI生成'}
      </button>
      {error ? <p style={{ color: '#8d2f2f' }}>{error}</p> : null}

      <div className="eco-col">
        <label className="eco-label">要約</label>
        <textarea rows={4} {...register('generated_cv_summary')} defaultValue={summary} />
      </div>
      <div className="eco-col">
        <label className="eco-label">詳細</label>
        <textarea rows={6} {...register('generated_cv_details')} defaultValue={details} />
      </div>
      <div className="eco-col">
        <label className="eco-label">スキル</label>
        <textarea rows={4} {...register('generated_cv_skills')} defaultValue={skills} />
      </div>
      <div className="eco-col">
        <label className="eco-label">自己PR</label>
        <textarea rows={6} {...register('generated_cv_pr')} defaultValue={pr} />
      </div>

      {(summary || details || skills || pr) && (
        <div className="eco-card" style={{ marginTop: 8 }}>
          <h4 className="eco-h3" style={{ marginTop: 0 }}>AI生成プレビュー</h4>
          <div style={{ display: 'grid', gap: 8 }}>
            {summary && (<div><strong>職務要約</strong><pre style={{ whiteSpace:'pre-wrap', margin: 0 }}>{summary}</pre></div>)}
            {details && (<div><strong>職務内容</strong><pre style={{ whiteSpace:'pre-wrap', margin: 0 }}>{details}</pre></div>)}
            {skills && (<div><strong>活かせる経験・知識</strong><pre style={{ whiteSpace:'pre-wrap', margin: 0 }}>{skills}</pre></div>)}
            {pr && (<div><strong>自己PR</strong><pre style={{ whiteSpace:'pre-wrap', margin: 0 }}>{pr}</pre></div>)}
          </div>
        </div>
      )}
    </div>
  );
}
