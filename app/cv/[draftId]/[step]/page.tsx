'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ProgressBar from '@/components/wizard/ProgressBar';
import StepFooter from '@/components/wizard/StepFooter';
import { getDraft, saveDraft, submitDraft } from '@/app/actions/drafts';
import {
  cvBasicSchema,
  cvContactSchema,
  cvPayloadSchema,
  type CvPayload,
} from '@/lib/schemas/cv';

const getValueFromPath = (values: unknown, path: string): unknown => {
  if (!values) return undefined;
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc === null || acc === undefined) return undefined;
    if (Array.isArray(acc)) {
      const index = Number(segment);
      if (Number.isNaN(index)) {
        return (acc as unknown as Record<string, unknown>)[segment];
      }
      return acc[index];
    }
    return (acc as Record<string, unknown>)[segment];
  }, values);
};

const stepDefinitions = [
  {
    id: 'basic',
    title: '基本情報',
    description: '氏名などの必須情報を入力してください。',
    fields: ['basic.lastName', 'basic.firstName', 'basic.kana', 'basic.birthDate'],
    schema: cvBasicSchema,
  },
  {
    id: 'contact',
    title: '連絡先',
    description: '住所や連絡先を入力します。',
    fields: ['contact.postalCode', 'contact.address', 'contact.phone', 'contact.email'],
    schema: cvContactSchema,
  },
  {
    id: 'education',
    title: '学歴',
    description: '学歴を1件以上入力できます（雛形）。',
    fields: ['education.0.school'],
    schema: z.any(),
  },
  {
    id: 'preview',
    title: 'プレビュー',
    description: '入力内容を確認し送信します。',
    fields: [],
    schema: z.any(),
  },
] as const;

type StepDefinition = (typeof stepDefinitions)[number];
type StepId = StepDefinition['id'];

const formSchema = cvPayloadSchema.partial();

export default function CvWizardStepPage() {
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

  const methods = useForm<CvPayload>({
    resolver: zodResolver(formSchema),
    defaultValues: { basic: {}, contact: {}, education: [] },
    mode: 'onChange',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const draft = await getDraft(draftId);
      if (cancelled) return;
      if (draft?.payload) {
        methods.reset(draft.payload as CvPayload);
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
    router.push(`/cv/${draftId}/${nextStep.id}`);
  };

  const watchedValues = useWatch<CvPayload>();

  const isCurrentStepValid = useMemo(() => {
    if (currentStep.fields.length === 0) {
      return true;
    }

    const hasErrors = currentStep.fields.some((field) => methods.getFieldState(field).invalid);
    if (hasErrors) {
      return false;
    }

    return currentStep.fields.every((field) => {
      const value = getValueFromPath(watchedValues, field);
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null;
    });
  }, [currentStep.fields, methods, watchedValues]);

  const nextStep = stepDefinitions[stepIndex + 1];
  const nextHref = nextStep ? `/cv/${draftId}/${nextStep.id}` : undefined;
  const canProceedToNext = Boolean(nextHref) && isCurrentStepValid;

  const handleSubmitAll = () => {
    startTransition(async () => {
      const values = methods.getValues();
      await saveDraft(draftId, values, totalSteps);
      await submitDraft(draftId);
      router.push(`/cv/${draftId}/preview`);
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
        {currentStep.id === 'basic' && <BasicStep />}
        {currentStep.id === 'contact' && <ContactStep />}
        {currentStep.id === 'education' && <EducationStep />}
        {currentStep.id === 'preview' && (
          <PreviewStep onSubmitAll={handleSubmitAll} submitting={isPending} draftId={draftId} />
        )}
      </div>
      <div className="h-20" />
      <StepFooter
        onBack={() => navigate(-1)}
        nextHref={currentStep.id === 'preview' ? undefined : canProceedToNext ? nextHref : undefined}
        nextDisabled={currentStep.id === 'preview' || !canProceedToNext}
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

function BasicStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CvPayload>();

  return (
    <div className="space-y-3">
      <Field label="姓" error={errors?.basic?.lastName}>
        <input className="w-full rounded border px-3 py-2" {...register('basic.lastName')} />
      </Field>
      <Field label="名" error={errors?.basic?.firstName}>
        <input className="w-full rounded border px-3 py-2" {...register('basic.firstName')} />
      </Field>
      <Field label="ふりがな" error={errors?.basic?.kana}>
        <input className="w-full rounded border px-3 py-2" {...register('basic.kana')} />
      </Field>
      <Field label="生年月日" error={errors?.basic?.birthDate}>
        <input type="date" className="w-full rounded border px-3 py-2" {...register('basic.birthDate')} />
      </Field>
    </div>
  );
}

function ContactStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CvPayload>();

  return (
    <div className="space-y-3">
      <Field label="郵便番号" error={errors?.contact?.postalCode}>
        <input className="w-full rounded border px-3 py-2" inputMode="numeric" {...register('contact.postalCode')} />
      </Field>
      <Field label="住所" error={errors?.contact?.address}>
        <input className="w-full rounded border px-3 py-2" {...register('contact.address')} />
      </Field>
      <Field label="電話番号" error={errors?.contact?.phone}>
        <input className="w-full rounded border px-3 py-2" inputMode="tel" {...register('contact.phone')} />
      </Field>
      <Field label="メールアドレス" error={errors?.contact?.email}>
        <input className="w-full rounded border px-3 py-2" type="email" {...register('contact.email')} />
      </Field>
    </div>
  );
}

function EducationStep() {
  const { register } = useFormContext<CvPayload>();
  return (
    <div className="space-y-3">
      <p className="text-xs text-[color:rgb(var(--muted-fg))]">シンプルな雛形です。繰り返し追加は次フェーズで拡張予定です。</p>
      <Field label="学校名">
        <input className="w-full rounded border px-3 py-2" {...register('education.0.school')} />
      </Field>
      <Field label="学位">
        <input className="w-full rounded border px-3 py-2" {...register('education.0.degree')} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="開始">
          <input className="w-full rounded border px-3 py-2" type="month" {...register('education.0.start')} />
        </Field>
        <Field label="終了">
          <input className="w-full rounded border px-3 py-2" type="month" {...register('education.0.end')} />
        </Field>
      </div>
    </div>
  );
}

function PreviewStep({
  onSubmitAll,
  submitting,
  draftId,
}: {
  onSubmitAll: () => void;
  submitting: boolean;
  draftId: string;
}) {
  const values = useWatch<CvPayload>();

  return (
    <div className="space-y-4">
      <section className="space-y-2 rounded-xl border p-4">
        <header>
          <h3 className="text-base font-semibold">基本情報</h3>
        </header>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[color:rgb(var(--muted-fg))]">氏名</dt>
            <dd>{values.basic?.lastName ?? '-'} {values.basic?.firstName ?? ''}</dd>
          </div>
          <div>
            <dt className="text-[color:rgb(var(--muted-fg))]">ふりがな</dt>
            <dd>{values.basic?.kana ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-[color:rgb(var(--muted-fg))]">生年月日</dt>
            <dd>{values.basic?.birthDate ?? '-'}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-2 rounded-xl border p-4">
        <header>
          <h3 className="text-base font-semibold">連絡先</h3>
        </header>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[color:rgb(var(--muted-fg))]">郵便番号</dt>
            <dd>{values.contact?.postalCode ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-[color:rgb(var(--muted-fg))]">住所</dt>
            <dd>{values.contact?.address ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-[color:rgb(var(--muted-fg))]">電話番号</dt>
            <dd>{values.contact?.phone ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-[color:rgb(var(--muted-fg))]">メール</dt>
            <dd>{values.contact?.email ?? '-'}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-2 rounded-xl border p-4">
        <header>
          <h3 className="text-base font-semibold">学歴</h3>
        </header>
        <div className="space-y-2 text-sm">
          {(values.education && values.education.length > 0 ? values.education : [{}]).map((item, index) => (
            <div key={index} className="rounded border border-dashed p-3">
              <div className="font-medium">{item?.school ?? '未入力'}</div>
              <div className="text-xs text-[color:rgb(var(--muted-fg))]">{item?.degree ?? '学位未入力'}</div>
              <div className="text-xs text-[color:rgb(var(--muted-fg))]">
                {item?.start ?? '-'} ~ {item?.end ?? '-'}
              </div>
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
        送信するとドラフトのステータスが <code>submitted</code> になり、プレビュー画面が更新されます。（ID: {draftId}）
      </p>
    </div>
  );
}
