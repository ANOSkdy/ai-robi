'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ProgressBar from '@/components/wizard/ProgressBar';
import StepFooter from '@/components/wizard/StepFooter';
import { getDraft, saveDraft, submitDraft } from '@/app/actions/drafts';
import { resumePayloadSchema, type ResumePayload } from '@/lib/schemas/resume';

const stepDefinitions = [
  {
    id: 'summary',
    title: '職務要約',
    description: '経歴のハイライトを200〜300文字程度でまとめましょう。',
    fields: ['summary'],
  },
  {
    id: 'skills',
    title: 'スキル',
    description: '得意分野を整理します。雛形では1件のみ入力できます。',
    fields: ['skills.0.name'],
  },
  {
    id: 'history',
    title: '職歴',
    description: '最新の職歴を入力します（雛形）。',
    fields: ['history.0.company'],
  },
  {
    id: 'preview',
    title: 'プレビュー',
    description: '内容を確認し送信します。',
    fields: [],
  },
] as const;

type StepDefinition = (typeof stepDefinitions)[number];
type StepId = StepDefinition['id'];

const formSchema = resumePayloadSchema.partial();

type ResumeFormValues = Partial<ResumePayload> & {
  skills?: ResumePayload['skills'];
  history?: ResumePayload['history'];
};

export default function ResumeWizardStepPage() {
  const params = useParams<{ draftId: string; step: StepId }>();
  const draftId = params.draftId;
  const stepParam = params.step;
  const router = useRouter();

  const stepIndex = useMemo(() => {
    const idx = stepDefinitions.findIndex((step) => step.id === stepParam);
    return idx >= 0 ? idx : 0;
  }, [stepParam]);

  const [savingState, setSavingState] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const [initialised, setInitialised] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceTimer = useRef<number | null>(null);

  const methods = useForm<ResumeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary: '',
      skills: [{ name: '', level: '', description: '' }],
      history: [{ company: '', role: '', start: '', end: '', detail: '' }],
    },
    mode: 'onChange',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const draft = await getDraft(draftId);
      if (cancelled) return;
      if (draft?.payload) {
        methods.reset(draft.payload as ResumeFormValues);
      }
      setInitialised(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [draftId, methods]);

  useEffect(() => {
    if (!initialised) return undefined;

    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = methods.watch(() => {
      setSavingState('syncing');
      const values = methods.getValues();
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = window.setTimeout(async () => {
        try {
          await saveDraft(draftId, values, stepIndex + 1);
          setSavingState('saved');
          window.setTimeout(() => setSavingState('idle'), 1200);
        } catch (error) {
          console.error(error);
          setSavingState('error');
        }
      }, 600);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }
    };
  }, [draftId, initialised, methods, stepIndex]);

  const currentStep = stepDefinitions[stepIndex] ?? stepDefinitions[0];
  const totalSteps = stepDefinitions.length;

  const navigate = (direction: -1 | 1) => {
    const nextIndex = stepIndex + direction;
    if (nextIndex < 0 || nextIndex >= totalSteps) return;
    const nextStep = stepDefinitions[nextIndex];
    router.push(`/resume/${draftId}/${nextStep.id}`);
  };

  const handleNext = async () => {
    if (currentStep.fields.length > 0) {
      const valid = await methods.trigger(currentStep.fields as Parameters<typeof methods.trigger>[0], {
        shouldFocus: true,
      });
      if (!valid) {
        return;
      }
    }
    navigate(1);
  };

  const handleSubmitAll = () => {
    startTransition(async () => {
      const values = methods.getValues();
      await saveDraft(draftId, values, totalSteps);
      await submitDraft(draftId);
      router.push(`/resume/${draftId}/preview`);
    });
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        <ProgressBar current={stepIndex + 1} total={totalSteps} />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[color:rgb(var(--fg))]">{currentStep.title}</h2>
          <p className="text-sm text-[color:rgb(var(--muted-fg))]">{currentStep.description}</p>
        </div>
        {currentStep.id === 'summary' && <SummaryStep />}
        {currentStep.id === 'skills' && <SkillsStep />}
        {currentStep.id === 'history' && <HistoryStep />}
        {currentStep.id === 'preview' && (
          <ResumePreviewStep submitting={isPending} onSubmitAll={handleSubmitAll} draftId={draftId} />
        )}
      </div>
      <div className="h-20" />
      <StepFooter
        onBack={() => navigate(-1)}
        onNext={currentStep.id === 'preview' ? undefined : handleNext}
        nextDisabled={currentStep.id === 'preview'}
        hideNextButton={currentStep.id === 'preview'}
        savingState={savingState}
      />
    </FormProvider>
  );
}

function Field({ label, children, error }: { label: string; children: ReactNode; error?: unknown }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-[color:rgb(var(--fg))]">{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-red-600">{String((error as { message?: string })?.message ?? error)}</span>
      ) : null}
    </label>
  );
}

function SummaryStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();
  return (
    <div className="space-y-3">
      <Field label="職務要約" error={errors.summary}>
        <textarea
          rows={5}
          className="w-full rounded border px-3 py-2"
          placeholder="例：B2B SaaSでのセールス・CSを通算5年担当…"
          {...register('summary')}
        />
      </Field>
    </div>
  );
}

function SkillsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();
  const skillError = (errors.skills && Array.isArray(errors.skills) ? errors.skills[0] : undefined) as
    | { name?: { message?: string } }
    | undefined;

  return (
    <div className="space-y-3">
      <p className="text-xs text-[color:rgb(var(--muted-fg))]">複数スキル対応は次フェーズで拡張予定です。</p>
      <Field label="スキル名" error={skillError?.name}>
        <input className="w-full rounded border px-3 py-2" {...register('skills.0.name')} />
      </Field>
      <Field label="レベル・経験年数">
        <input className="w-full rounded border px-3 py-2" placeholder="例：5年 / 上級" {...register('skills.0.level')} />
      </Field>
      <Field label="補足">
        <textarea rows={3} className="w-full rounded border px-3 py-2" {...register('skills.0.description')} />
      </Field>
    </div>
  );
}

function HistoryStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();
  const historyError = (errors.history && Array.isArray(errors.history) ? errors.history[0] : undefined) as
    | { company?: { message?: string } }
    | undefined;

  return (
    <div className="space-y-3">
      <Field label="会社名" error={historyError?.company}>
        <input className="w-full rounded border px-3 py-2" {...register('history.0.company')} />
      </Field>
      <Field label="役職">
        <input className="w-full rounded border px-3 py-2" {...register('history.0.role')} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="入社">
          <input className="w-full rounded border px-3 py-2" type="month" {...register('history.0.start')} />
        </Field>
        <Field label="退社">
          <input className="w-full rounded border px-3 py-2" type="month" {...register('history.0.end')} />
        </Field>
      </div>
      <Field label="担当業務 / 実績">
        <textarea rows={4} className="w-full rounded border px-3 py-2" {...register('history.0.detail')} />
      </Field>
    </div>
  );
}

function ResumePreviewStep({
  submitting,
  onSubmitAll,
  draftId,
}: {
  submitting: boolean;
  onSubmitAll: () => void;
  draftId: string;
}) {
  const values = useWatch<ResumeFormValues>();

  return (
    <div className="space-y-4">
      <section className="space-y-2 rounded-xl border p-4">
        <h3 className="text-base font-semibold">職務要約</h3>
        <p className="whitespace-pre-wrap text-sm">{values.summary || '未入力'}</p>
      </section>

      <section className="space-y-2 rounded-xl border p-4">
        <h3 className="text-base font-semibold">スキル</h3>
        <div className="space-y-2 text-sm">
          {(values.skills && values.skills.length > 0 ? values.skills : [{}]).map((skill, index) => (
            <div key={index} className="rounded border border-dashed p-3">
              <div className="font-medium">{skill?.name || '未入力'}</div>
              <div className="text-xs text-[color:rgb(var(--muted-fg))]">{skill?.level || 'レベル未入力'}</div>
              <p className="text-xs text-[color:rgb(var(--muted-fg))]">{skill?.description || '補足なし'}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2 rounded-xl border p-4">
        <h3 className="text-base font-semibold">職歴</h3>
        <div className="space-y-2 text-sm">
          {(values.history && values.history.length > 0 ? values.history : [{}]).map((item, index) => (
            <div key={index} className="rounded border border-dashed p-3">
              <div className="font-medium">{item?.company || '未入力'}</div>
              <div className="text-xs text-[color:rgb(var(--muted-fg))]">{item?.role || '役職未入力'}</div>
              <div className="text-xs text-[color:rgb(var(--muted-fg))]">
                {item?.start || '-'} ~ {item?.end || '-'}
              </div>
              <p className="text-xs text-[color:rgb(var(--muted-fg))] whitespace-pre-wrap">{item?.detail || '詳細未入力'}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSubmitAll}
          disabled={submitting}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[color:var(--color-accent-3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent-1)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? '送信中…' : 'ドラフトを送信'}
        </button>
      </div>
      <p className="text-xs text-[color:rgb(var(--muted-fg))]">
        送信するとステータスが <code>submitted</code> になり、プレビューが更新されます。（ID: {draftId}）
      </p>
    </div>
  );
}
