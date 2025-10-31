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
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setTab('resume')} aria-pressed={tab==='resume'}>履歴書</button>
        <button type="button" onClick={() => setTab('cv')} aria-pressed={tab==='cv'}>職務経歴書</button>
        <div style={{ flex: 1 }} />
        <button type="submit" style={{ fontWeight: 600 }}>入力を確定</button>
      </div>
      {tab === 'resume' ? <ResumeFields /> : <CvFields />}
    </form>
  );
}

