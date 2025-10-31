import type { HTMLAttributes } from 'react';

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
  const classes = ['flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      <button
        type="button"
        onClick={onBack}
        className="btn btn-secondary px-6 py-3 text-sm uppercase tracking-[0.18em]"
      >
        {isFirst ? `${backLabel}（ホームへ）` : backLabel}
      </button>
      <div className="flex flex-col items-end gap-3 text-right">
        {!canProceed ? (
          <p className="text-sm font-medium text-brand-earth2">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-earth1/20 text-brand-earth2">
              !
            </span>
            {validationMessage}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onNext}
          className="btn btn-primary px-8 py-3 text-sm uppercase tracking-[0.2em]"
        >
          {isLast ? '完了' : nextLabel}
        </button>
      </div>
    </div>
  );
}

export type { WizardNavProps };
