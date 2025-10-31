'use client';

import { useState, type ComponentType, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import WizardFrame from '@/components/wizard/WizardFrame';
import OrganicDivider from '@/components/OrganicDivider';
import LeafIcon from '@/components/icons/Leaf';
import SunIcon from '@/components/icons/Sun';
import { resumeFormSchema, type ResumeFormData } from '@/lib/schema';
import FormSection from '@/components/FormSection';
import ResultSection from '@/components/ResultSection';
import { OverlayProvider } from '@/components/OverlayProvider';

const resumeWizardSchema = z.object({
  name: z.string().min(1, '氏名を入力してください'),
  nameFurigana: z.string().min(1, 'ふりがなを入力してください'),
  email: z.string().min(1, 'メールアドレスを入力してください').email('正しいメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  birthYear: z.string().min(4, '年を4桁で入力してください').max(4, '年を4桁で入力してください'),
  birthMonth: z.string().min(1, '月を入力してください').max(2, '2桁で入力してください'),
  birthDay: z.string().min(1, '日を入力してください').max(2, '2桁で入力してください'),
  address: z.string().min(1, '住所を入力してください'),
  educationSummary: z.string().min(1, '学歴を入力してください'),
  educationHighlights: z.string().optional(),
  certifications: z.string().min(1, '資格・免許を入力してください'),
  skills: z.string().min(1, 'スキルを入力してください'),
  summary: z.string().min(1, '自己PRを入力してください'),
});

type ResumeWizardForm = z.infer<typeof resumeWizardSchema>;

type StepProps = { values: ResumeWizardForm; submitted: boolean };

type StepField = keyof ResumeWizardForm;

type ResumeStep = {
  title: string;
  description: string;
  fields: readonly StepField[];
  component: ComponentType<StepProps>;
};

const resumeSteps = [
  {
    title: '基本情報',
    description: '氏名や連絡先を明るい緑のトーンで整え、応募者らしさの土台をつくります。',
    fields: ['name', 'nameFurigana', 'email', 'phone', 'birthYear', 'birthMonth', 'birthDay', 'address'] as const,
    component: BasicInfoStep,
  },
  {
    title: '学歴',
    description: '進路のストーリーを枝葉のように重ね、学びの軌跡を記録しましょう。',
    fields: ['educationSummary', 'educationHighlights'] as const,
    component: EducationStep,
  },
  {
    title: '資格とスキル',
    description: '資格やスキルを葉脈のように整理し、強みのニュアンスを伝えます。',
    fields: ['certifications', 'skills', 'summary'] as const,
    component: SkillsStep,
  },
  {
    title: '確認',
    description: '入力内容を俯瞰し、心地よい余白とともに最終チェック。',
    fields: ['name'] as const,
    component: ConfirmationStep,
  },
] satisfies readonly ResumeStep[];

export default function ResumeWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const methods = useForm<ResumeWizardForm>({
    resolver: zodResolver(resumeWizardSchema),
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      name: '',
      nameFurigana: '',
      email: '',
      phone: '',
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      address: '',
      educationSummary: '',
      educationHighlights: '',
      certifications: '',
      skills: '',
      summary: '',
    },
  });

  const { handleSubmit, trigger, formState, getValues } = methods;
  const step = resumeSteps[currentStep];
  const values = getValues();

  const handleNext = async () => {
    const valid = await trigger(step.fields, { shouldFocus: true });
    if (!valid) return;
    if (currentStep === resumeSteps.length - 1) {
      await handleSubmit(() => {
        setSubmitted(true);
      })();
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, resumeSteps.length - 1));
  };

  const handleBack = () => {
    if (currentStep === 0) {
      router.push('/');
      return;
    }
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const canProceed = !step.fields.some((field) => hasFieldError(formState.errors, field));

  return (
    <FormProvider {...methods}>
      <WizardFrame
        title={step.title}
        description={step.description}
        accent={<LeafIcon width={28} height={28} aria-hidden />}
        steps={resumeSteps.map((s) => s.title)}
        currentStep={currentStep}
        nav={{
          onBack: handleBack,
          onNext: handleNext,
          isFirst: currentStep === 0,
          isLast: currentStep === resumeSteps.length - 1,
          canProceed,
          validationMessage: '未入力の項目があります。深呼吸してからもう一度見直しましょう。',
        }}
      >
        <step.component submitted={submitted} values={values} />
        {submitted && currentStep === resumeSteps.length - 1 ? (
          <p className="rounded-3xl border border-brand-green2/30 bg-white/80 px-6 py-4 text-sm text-brand-green1">
            自然な書類づくりの準備が整いました。PDF 出力や保存フローは今後のアップデートでお届けします。
          </p>
        ) : null}
      </WizardFrame>
    </FormProvider>
  );
}

function BasicInfoStep({ values, submitted }: StepProps) {
  void values;
  void submitted;
  const {
    register,
    formState: { errors },
  } = useFormContext<ResumeWizardForm>();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="氏名" error={errors.name}>
          <input
            id="name"
            {...register('name')}
            className="brand-field rounded-organic w-full"
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
          />
        </Field>
        <Field label="ふりがな" error={errors.nameFurigana}>
          <input
            id="nameFurigana"
            {...register('nameFurigana')}
            className="brand-field rounded-organic w-full"
            aria-invalid={Boolean(errors.nameFurigana)}
            autoComplete="name"
          />
        </Field>
        <Field label="メールアドレス" error={errors.email}>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="brand-field rounded-organic w-full"
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
          />
        </Field>
        <Field label="電話番号" error={errors.phone}>
          <input
            id="phone"
            {...register('phone')}
            className="brand-field rounded-organic w-full"
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel"
          />
        </Field>
      </div>
      <OrganicDivider variant="hand" />
      <div className="grid gap-6 md:grid-cols-[1fr,auto]">
        <Field label="住所" error={errors.address} className="md:col-span-2">
          <textarea
            id="address"
            {...register('address')}
            className="brand-field rounded-organic w-full"
            aria-invalid={Boolean(errors.address)}
            rows={3}
          />
        </Field>
        <div className="grid grid-cols-3 gap-4 md:col-span-2 md:max-w-md">
          <Field label="生年" error={errors.birthYear}>
            <input
              id="birthYear"
              {...register('birthYear')}
              className="brand-field rounded-organic w-full"
              aria-invalid={Boolean(errors.birthYear)}
              inputMode="numeric"
              maxLength={4}
            />
          </Field>
          <Field label="月" error={errors.birthMonth}>
            <input
              id="birthMonth"
              {...register('birthMonth')}
              className="brand-field rounded-organic w-full"
              aria-invalid={Boolean(errors.birthMonth)}
              inputMode="numeric"
              maxLength={2}
            />
          </Field>
          <Field label="日" error={errors.birthDay}>
            <input
              id="birthDay"
              {...register('birthDay')}
              className="brand-field rounded-organic w-full"
              aria-invalid={Boolean(errors.birthDay)}
              inputMode="numeric"
              maxLength={2}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function EducationStep({ values, submitted }: StepProps) {
  void values;
  void submitted;
  const {
    register,
    formState: { errors },
  } = useFormContext<ResumeWizardForm>();

  return (
    <div className="space-y-6">
      <Field label="学歴の概要" error={errors.educationSummary}>
        <textarea
          id="educationSummary"
          {...register('educationSummary')}
          className="brand-field rounded-organic w-full"
          aria-invalid={Boolean(errors.educationSummary)}
          rows={5}
          placeholder="例：20XX年4月〜20XX年3月 ○○大学 △△学部 △△学科 卒業"
        />
      </Field>
      <Field label="学びのハイライト (任意)" error={errors.educationHighlights}>
        <textarea
          id="educationHighlights"
          {...register('educationHighlights')}
          className="brand-field rounded-organic w-full"
          aria-invalid={Boolean(errors.educationHighlights)}
          rows={4}
          placeholder="研究テーマや課外活動、留学経験などを自由に記入"
        />
      </Field>
    </div>
  );
}

function SkillsStep({ values, submitted }: StepProps) {
  void values;
  void submitted;
  const {
    register,
    formState: { errors },
  } = useFormContext<ResumeWizardForm>();

  return (
    <div className="space-y-6">
      <Field label="資格・免許" error={errors.certifications}>
        <textarea
          id="certifications"
          {...register('certifications')}
          className="brand-field rounded-organic w-full"
          aria-invalid={Boolean(errors.certifications)}
          rows={4}
          placeholder="例：普通自動車免許（AT限定）／TOEIC 850点"
        />
      </Field>
      <Field label="スキル" error={errors.skills}>
        <textarea
          id="skills"
          {...register('skills')}
          className="brand-field rounded-organic w-full"
          aria-invalid={Boolean(errors.skills)}
          rows={4}
          placeholder="業務で活かせる技術や強みを箇条書きで"
        />
      </Field>
      <OrganicDivider variant="hand" />
      <Field label="自己PR" error={errors.summary}>
        <textarea
          id="summary"
          {...register('summary')}
          className="brand-field rounded-organic w-full"
          aria-invalid={Boolean(errors.summary)}
          rows={5}
          placeholder="価値観やキャリアのテーマを自然体で伝えましょう"
        />
      </Field>
    </div>
  );
}

function ConfirmationStep({ values }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-[2rem] border border-brand-green2/30 bg-white/80 p-6 text-sm text-brand-green1">
        <DetailRow label="氏名" value={values.name} />
        <DetailRow label="ふりがな" value={values.nameFurigana} />
        <DetailRow label="メール" value={values.email} />
        <DetailRow label="電話" value={values.phone} />
        <DetailRow label="生年月日" value={`${values.birthYear}年 ${values.birthMonth}月 ${values.birthDay}日`} />
        <DetailRow label="住所" value={values.address} />
      </div>
      <div className="space-y-4 rounded-[2rem] border border-brand-earth1/30 bg-white/70 p-6 text-sm text-brand-green1">
        <DetailRow label="学歴" value={values.educationSummary} />
        {values.educationHighlights ? <DetailRow label="学びのハイライト" value={values.educationHighlights} /> : null}
        <DetailRow label="資格・免許" value={values.certifications} />
        <DetailRow label="スキル" value={values.skills} />
        <DetailRow label="自己PR" value={values.summary} />
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  error,
  className = '',
}: {
  label: string;
  children: ReactNode;
  error: unknown;
  className?: string;
}) {
  const classes = ['grid gap-2', className].filter(Boolean).join(' ');
  const message = extractErrorMessage(error);
  return (
    <label className={classes}>
      <span className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green1">{label}</span>
      {children}
      {message ? <span className="validation-text">{message}</span> : null}
    </label>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-earth2">{label}</span>
      <p className="rounded-2xl bg-white/70 px-4 py-3 text-brand-green1">{value || '---'}</p>
    </div>
  );
}

function extractErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return undefined;
}

function hasFieldError(errors: FieldErrors<ResumeWizardForm>, field: string): boolean {
  const segments = field.split('.');
  let current: unknown = errors;
  for (const segment of segments) {
    if (!current || typeof current !== 'object') return false;
    current = (current as Record<string, unknown>)[segment];
  }
  return Boolean(current);
}

export function LegacyResumeAppPage() {
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
  const [view, setView] = useState<'form' | 'result'>('form');
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
