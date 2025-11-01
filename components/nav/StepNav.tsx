'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import Button from '@/components/ui/Button';

type StepNavProps = {
  backHref?: string;
  nextHref?: string;
  backLabel?: string;
  nextLabel?: string;
  onNext?: () => Promise<void> | void;
  onBack?: () => Promise<void> | void;
  isNextDisabled?: boolean;
  className?: string;
};

const mergeClassName = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

export default function StepNav({
  backHref,
  nextHref,
  backLabel = '戻る',
  nextLabel = '次へ',
  onNext,
  onBack,
  isNextDisabled,
  className,
}: StepNavProps) {
  const router = useRouter();

  const handleBack = useCallback(async () => {
    if (onBack) {
      await onBack();
      return;
    }
    if (backHref) {
      router.push(backHref);
      return;
    }
    router.back();
  }, [backHref, onBack, router]);

  const handleNext = useCallback(async () => {
    if (onNext) {
      await onNext();
    }
    if (nextHref) {
      router.push(nextHref);
    }
  }, [nextHref, onNext, router]);

  return (
    <nav
      aria-label="ステップナビゲーション"
      className={mergeClassName('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}
    >
      <Button variant="ghost" onClick={handleBack} aria-label={backLabel} className="w-full sm:w-auto">
        {backLabel}
      </Button>
      <Button onClick={handleNext} disabled={isNextDisabled} aria-label={nextLabel} className="w-full sm:w-auto">
        {nextLabel}
      </Button>
    </nav>
  );
}
