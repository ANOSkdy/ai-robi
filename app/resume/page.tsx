
'use client';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resumeFormSchema, type ResumeFormData } from '@/lib/schema';
import FormSection from '@/components/FormSection';
import ResultSection from '@/components/ResultSection';
import LeafIcon from '@/components/icons/Leaf';
import SunIcon from '@/components/icons/Sun';
import { OverlayProvider } from '@/components/OverlayProvider';
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
    <div className="eco">
      <OverlayProvider>
        <div className="eco-shell">
          <div className="eco-container">
            <header className="eco-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <LeafIcon width={24} height={24} />
                <div>
                  <div className="eco-title">AI 履歴書・職務経歴書ジェネレーター</div>
                  <div className="eco-sub">RHF + Zod / Gemini / PDF（Puppeteer）</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <SunIcon width={22} height={22} />
                </div>
              </div>
            </header>

            <main style={{ marginTop: 16 }}>
              <FormProvider {...methods}>
                {view === 'form' ? (
                  <FormSection onSubmit={onSubmit} />
                ) : finalData ? (
                  <ResultSection formData={finalData} onBack={() => setView('form')} />
                ) : null}
              </FormProvider>
            </main>
          </div>
        </div>
      </OverlayProvider>
    </div>
  );
}

