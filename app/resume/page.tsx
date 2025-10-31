'use client';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resumeFormSchema, type ResumeFormData } from '@/lib/schema';
import FormSection from '@/components/FormSection';
import ResultSection from '@/components/ResultSection';

export default function ResumeAppPage() {
  const methods = useForm<ResumeFormData>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      gender: '未選択',
      same_as_current_address: true,
      history: [],
      qualifications: [],
    },
    mode: 'onSubmit',
  });
  const [view, setView] = useState<'form'|'result'>('form');
  const [finalData, setFinalData] = useState<ResumeFormData | null>(null);

  const onSubmit = () => {
    const data = methods.getValues();
    setFinalData(data);
    setView('result');
  };

  return (
    <div style={{ maxWidth: 1040, margin: '24px auto', padding: '0 16px', display: 'grid', gap: 16 }}>
      <h1 style={{ marginBottom: 0 }}>AI 履歴書・職務経歴書ジェネレーター</h1>
      <p style={{ opacity: .7, marginTop: 0 }}>RHF + Zod / Gemini / Puppeteer PDF</p>
      <FormProvider {...methods}>
        {view === 'form' ? (
          <FormSection onSubmit={onSubmit} />
        ) : finalData ? (
          <ResultSection formData={finalData} onBack={() => setView('form')} />
        ) : null}
      </FormProvider>
    </div>
  );
}

