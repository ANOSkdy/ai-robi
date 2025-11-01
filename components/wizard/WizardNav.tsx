import type { HTMLAttributes } from 'react';
import StepNav from '@/components/nav/StepNav';

interface WizardNavProps extends HTMLAttributes<HTMLDivElement> {
  onBack: () => void;
  onNext: () => void | Promise<void>;
  isFirst: boolean;
  isLast: boolean;
  canProceed: boolean;
  nextLabel?: string;
  backLabel?: string;
  validationMessage?: string;
}

const mergeClassName = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

export default function WizardNav({
  onBack,
  onNext,
  isFirst,
  isLast,
  canProceed,
  nextLabel = '進む',
  backLabel = '戻る',
  validationMessage = '必須項目を入力すると自然に次へ進めます。',
  className = '',
  ...props
}: WizardNavProps) {
  return (
    <div className={mergeClassName('space-y-3', className)} {...props}>
      {!canProceed ? (
        <p
          className="flex items-center gap-2 rounded-2xl bg-accent1/10 px-4 py-3 text-sm font-medium text-brand-earth2"
          aria-live="polite"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent2/20 text-accent2">!</span>
          {validationMessage}
        </p>
      ) : null}
      <StepNav
        onBack={onBack}
        onNext={onNext}
        isNextDisabled={!canProceed}
        backLabel={isFirst ? `${backLabel}（ホームへ）` : backLabel}
        nextLabel={isLast ? '完了' : nextLabel}
      />
    </div>
  );
}

export type { WizardNavProps };
