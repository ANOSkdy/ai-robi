'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

type StepFooterProps = {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  savingState?: 'idle' | 'syncing' | 'saved' | 'error';
  hideNextButton?: boolean;
  /** onNext が無い場合のフォールバック遷移先 */
  nextHref?: string;
  /** onBack が無い場合のフォールバック遷移先 */
  backHref?: string;
  /** フォーム内で submit として扱う場合（onNext が無い時のfallback） */
  asSubmitOnForm?: boolean;
};

const buttonBaseClass =
  'relative inline-flex min-h-[3rem] items-center justify-center rounded-2xl px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 soft-shadow';

const buttonVariantClass = {
  primary:
    'bg-[color:var(--color-primary)] text-white focus-visible:outline-[color:var(--color-accent-1)]',
  secondary:
    'bg-[color:var(--color-secondary)] text-[color:rgb(var(--fg))] focus-visible:outline-[color:var(--color-accent-2)]',
} as const;

const classNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(' ');

export default function StepFooter({
  onBack,
  onNext,
  nextDisabled,
  savingState = 'idle',
  hideNextButton,
  nextHref,
  backHref,
  asSubmitOnForm,
}: StepFooterProps) {
  const router = useRouter();

  const statusMessage = useMemo(() => {
    switch (savingState) {
      case 'syncing':
        return '保存中…';
      case 'saved':
        return '保存済み';
      case 'error':
        return '保存に失敗しました';
      default:
        return null;
    }
  }, [savingState]);

  const renderBackButton = useCallback(() => {
    const className = classNames(buttonBaseClass, buttonVariantClass.secondary);

    if (onBack) {
      return (
        <button type="button" onClick={onBack} className={className} aria-label="戻る">
          戻る
        </button>
      );
    }

    if (backHref) {
      return (
        <Link href={backHref} className="inline-flex" aria-label="戻る">
          <span className={className}>戻る</span>
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={() => router.back()}
        className={className}
        aria-label="戻る"
      >
        戻る
      </button>
    );
  }, [backHref, onBack, router]);

  const renderNextButton = useCallback(() => {
    if (hideNextButton) {
      return null;
    }

    const className = classNames(buttonBaseClass, buttonVariantClass.primary);

    if (onNext) {
      return (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={className}
          aria-label="次へ"
        >
          次へ
        </button>
      );
    }

    if (asSubmitOnForm) {
      return (
        <button type="submit" disabled={nextDisabled} className={className} aria-label="次へ">
          次へ
        </button>
      );
    }

    if (nextHref && !nextDisabled) {
      return (
        <Link href={nextHref} className="inline-flex" aria-label="次へ">
          <span className={className}>次へ</span>
        </Link>
      );
    }

    return (
      <button type="button" className={className} disabled aria-label="次へ（無効）">
        次へ
      </button>
    );
  }, [asSubmitOnForm, hideNextButton, nextDisabled, nextHref, onNext]);

  return (
    <div className="fixed inset-x-0 bottom-0 border-t border-[color:rgb(var(--border))] bg-[color:var(--color-base)]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-4 py-3">
        {renderBackButton()}
        <div className="min-h-[1.25rem] flex-1 text-center text-xs text-[color:var(--color-accent-3)]" aria-live="polite">
          {statusMessage}
        </div>
        {renderNextButton()}
      </div>
    </div>
  );
}
