'use client';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import ResumeFields from './ResumeFields';
import CvFields from './CvFields';

export default function FormSection({ onSubmit }: { onSubmit: () => void }) {
  const [tab, setTab] = useState<'resume'|'cv'>('resume');
  const { handleSubmit } = useFormContext();

  return (
    <form onSubmit={handleSubmit(() => onSubmit())} style={{ display: 'grid', gap: 16 }}>
      <div className="eco-tabs">
        <button type="button" className="eco-tab" onClick={() => setTab('resume')} aria-pressed={tab==='resume'}>
          履歴書
        </button>
        <button type="button" className="eco-tab" onClick={() => setTab('cv')} aria-pressed={tab==='cv'}>
          職務経歴書
        </button>
        <div className="eco-spacer" />
        <button type="submit" className="eco-submit">
          入力を確定
        </button>
      </div>
      {tab === 'resume' ? <ResumeFields /> : <CvFields />}
    </form>
  );
}
