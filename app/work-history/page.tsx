'use client';

import { useState, type ComponentType, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import WizardFrame from '@/components/wizard/WizardFrame';
import OrganicDivider from '@/components/OrganicDivider';
import DropletIcon from '@/components/icons/Droplet';

const workHistorySchema = z.object({
  fullName: z.string().min(1, '氏名を入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('正しいメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  professionalTitle: z.string().min(1, '職種や肩書きを入力してください'),
  introduction: z.string().min(1, 'プロフィール概要を入力してください'),
  experiences: z
    .array(
      z.object({
        company: z.string().min(1, '会社名を入力してください'),
        role: z.string().min(1, '役職を入力してください'),
        start: z.string().min(1, '開始時期を入力してください'),
        end: z.string().min(1, '終了時期・現在を入力してください'),
        achievements: z.string().min(1, '主な実績を入力してください'),
      })
    )
    .min(1, '経歴を1件以上入力してください'),
  achievements: z.string().min(1, '代表的な実績を入力してください'),
  skills: z.string().min(1, 'スキルを入力してください'),
  summary: z.string().min(1, '自己PRを入力してください'),
});

type WorkHistoryForm = z.infer<typeof workHistorySchema>;

type StepProps = { values: WorkHistoryForm; submitted: boolean };

type StepField = keyof WorkHistoryForm;

type WizardStep = {
  title: string;
  description: string;
  fields: readonly StepField[];
  component: ComponentType<StepProps>;
};

const steps = [
  {
    title: '基本情報',
    description: '肩書きとプロフィールを最初にまとめ、あなたの現在地を軽やかに伝えます。',
    fields: ['fullName', 'email', 'phone', 'professionalTitle', 'introduction'] as const,
    component: BasicInfoStep,
  },
  {
    title: '職務経歴',
    description: '会社・役職・期間を蔓のように連ね、実績エピソードを整えましょう。',
    fields: ['experiences'] as const,
    component: ExperiencesStep,
  },
  {
    title: '実績とスキル',
    description: '成果とスキルを光の粒のように散りばめて、強みを際立たせます。',
    fields: ['achievements', 'skills', 'summary'] as const,
    component: AchievementsStep,
  },
  {
    title: '確認',
    description: '全体像を俯瞰し、自然なリズムで最終チェック。',
    fields: ['fullName'] as const,
    component: ConfirmationStep,
  },
] satisfies readonly WizardStep[];

export default function WorkHistoryWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const methods = useForm<WorkHistoryForm>({
    resolver: zodResolver(workHistorySchema),
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      professionalTitle: '',
      introduction: '',
      experiences: [{ company: '', role: '', start: '', end: '', achievements: '' }],
      achievements: '',
      skills: '',
      summary: '',
    },
  });

  const { handleSubmit, trigger, formState, getValues } = methods;
  const step = steps[currentStep];
  const values = getValues();

  const handleNext = async () => {
    const valid = await trigger(step.fields, { shouldFocus: true });
    if (!valid) return;
    if (currentStep === steps.length - 1) {
      await handleSubmit(() => {
        setSubmitted(true);
      })();
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
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
        accent={<DropletIcon width={28} height={28} aria-hidden />}
        steps={steps.map((s) => s.title)}
        currentStep={currentStep}
        nav={{
          onBack: handleBack,
          onNext: handleNext,
          isFirst: currentStep === 0,
          isLast: currentStep === steps.length - 1,
          canProceed,
          validationMessage: '未入力の項目があります。実績や期間をもう一度確認してください。',
        }}
      >
        <step.component submitted={submitted} values={values} />
        {submitted && currentStep === steps.length - 1 ? (
          <p className="rounded-3xl border border-accent-1/40 bg-white/85 px-6 py-4 text-sm text-primary">
            職務経歴の骨組みが完成しました。仕上げのフォーマット出力はこれからのリリースでご案内します。
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
  } = useFormContext<WorkHistoryForm>();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="氏名" error={errors.fullName}>
          <input
            id="fullName"
            {...register('fullName')}
            className="brand-field rounded-organic w-full"
            aria-invalid={Boolean(errors.fullName)}
            autoComplete="name"
          />
        </Field>
        <Field label="職種 / 肩書き" error={errors.professionalTitle}>
          <input
            id="professionalTitle"
            {...register('professionalTitle')}
            className="brand-field rounded-organic w-full"
            aria-invalid={Boolean(errors.professionalTitle)}
            placeholder="例：プロダクトマネージャー"
          />
        </Field>
        <Field label="メールアドレス" error={errors.email}>
          <input
            id="workEmail"
            type="email"
            {...register('email')}
            className="brand-field rounded-organic w-full"
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
          />
        </Field>
        <Field label="電話番号" error={errors.phone}>
          <input
            id="workPhone"
            {...register('phone')}
            className="brand-field rounded-organic w-full"
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel"
          />
        </Field>
      </div>
      <Field label="プロフィール概要" error={errors.introduction}>
        <textarea
          id="introduction"
          {...register('introduction')}
          className="brand-field rounded-organic w-full"
          aria-invalid={Boolean(errors.introduction)}
          rows={4}
          placeholder="経験領域や価値提供のスタイルを 3〜4 行でまとめましょう"
        />
      </Field>
    </div>
  );
}

function ExperiencesStep({ submitted, values }: StepProps) {
  void values;
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<WorkHistoryForm>();
  const { fields, append, remove } = useFieldArray({ control, name: 'experiences' });

  return (
    <div className="space-y-8">
      {fields.map((field, index) => {
        const fieldError = errors.experiences?.[index];
        return (
          <div
            key={field.id}
            className="space-y-4 rounded-[2.5rem] border border-secondary/25 bg-white/80 p-6 shadow-inner"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                経歴 {index + 1}
              </h3>
              {fields.length > 1 ? (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="btn btn-secondary px-4 py-2 text-xs uppercase tracking-[0.2em]"
                >
                  削除
                </button>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="会社名" error={fieldError?.company}>
                <input
                  {...register(`experiences.${index}.company` as const)}
                  className="brand-field rounded-organic w-full"
                  aria-invalid={Boolean(fieldError?.company)}
                />
              </Field>
              <Field label="役職" error={fieldError?.role}>
                <input
                  {...register(`experiences.${index}.role` as const)}
                  className="brand-field rounded-organic w-full"
                  aria-invalid={Boolean(fieldError?.role)}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="開始時期" error={fieldError?.start}>
                <input
                  {...register(`experiences.${index}.start` as const)}
                  className="brand-field rounded-organic w-full"
                  aria-invalid={Boolean(fieldError?.start)}
                  placeholder="例：2020年4月"
                />
              </Field>
              <Field label="終了時期 / 現在" error={fieldError?.end}>
                <input
                  {...register(`experiences.${index}.end` as const)}
                  className="brand-field rounded-organic w-full"
                  aria-invalid={Boolean(fieldError?.end)}
                  placeholder="例：現在"
                />
              </Field>
            </div>
            <Field label="主な実績" error={fieldError?.achievements}>
              <textarea
                {...register(`experiences.${index}.achievements` as const)}
                className="brand-field rounded-organic w-full"
                aria-invalid={Boolean(fieldError?.achievements)}
                rows={4}
                placeholder="成果を箇条書きで記載しましょう"
              />
            </Field>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() =>
          append({ company: '', role: '', start: '', end: '', achievements: '' }, { shouldFocus: true })
        }
        className="btn btn-primary self-start px-6 py-3 text-xs uppercase tracking-[0.2em]"
      >
        経歴を追加
      </button>
      {submitted ? null : <OrganicDivider variant="hand" />}
    </div>
  );
}

function AchievementsStep({ values, submitted }: StepProps) {
  void values;
  void submitted;
  const {
    register,
    formState: { errors },
  } = useFormContext<WorkHistoryForm>();

  return (
    <div className="space-y-6">
      <Field label="代表的な実績" error={errors.achievements}>
        <textarea
          id="achievements"
          {...register('achievements')}
          className="brand-field rounded-organic w-full"
          aria-invalid={Boolean(errors.achievements)}
          rows={4}
          placeholder="チームで達成した成果や KPI 改善などを記入"
        />
      </Field>
      <Field label="スキル" error={errors.skills}>
        <textarea
          id="skillset"
          {...register('skills')}
          className="brand-field rounded-organic w-full"
          aria-invalid={Boolean(errors.skills)}
          rows={4}
          placeholder="技術・マネジメント・ソフトスキルなど"
        />
      </Field>
      <OrganicDivider variant="hand" />
      <Field label="自己PR" error={errors.summary}>
        <textarea
          id="workSummary"
          {...register('summary')}
          className="brand-field rounded-organic w-full"
          aria-invalid={Boolean(errors.summary)}
          rows={5}
          placeholder="実績から導かれる価値提供スタイルをまとめましょう"
        />
      </Field>
    </div>
  );
}

function ConfirmationStep({ values }: StepProps) {
  return (
    <div className="space-y-6 text-sm text-primary">
      <div className="rounded-[2.5rem] border border-secondary/30 bg-white/80 p-6">
        <Detail label="氏名" value={values.fullName} />
        <Detail label="肩書き" value={values.professionalTitle} />
        <Detail label="メール" value={values.email} />
        <Detail label="電話" value={values.phone} />
        <Detail label="プロフィール概要" value={values.introduction} />
      </div>
      <div className="space-y-4 rounded-[2.5rem] border border-accent-1/30 bg-white/75 p-6">
        {values.experiences.map((exp, index) => (
          <div key={`${exp.company}-${index}`} className="space-y-2 rounded-2xl bg-white/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-2">
              {exp.company} / {exp.role}
            </p>
            <p className="text-xs text-accent-2/80">
              {exp.start} 〜 {exp.end}
            </p>
            <p>{exp.achievements}</p>
          </div>
        ))}
      </div>
      <div className="space-y-4 rounded-[2.5rem] border border-secondary/30 bg-white/75 p-6">
        <Detail label="代表的な実績" value={values.achievements} />
        <Detail label="スキル" value={values.skills} />
        <Detail label="自己PR" value={values.summary} />
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
      <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{label}</span>
      {children}
      {message ? <span className="validation-text">{message}</span> : null}
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-2">{label}</span>
      <p className="rounded-2xl bg-white/70 px-4 py-3 text-primary">{value || '---'}</p>
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

function hasFieldError(errors: FieldErrors<WorkHistoryForm>, field: string) {
  const parts = field.split('.');
  let current: unknown = errors;
  for (const part of parts) {
    if (!current || typeof current !== 'object') return false;
    current = (current as Record<string, unknown>)[part];
  }
  return Boolean(current);
}
