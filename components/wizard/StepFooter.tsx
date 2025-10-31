'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

type StepFooterProps = {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  savingState?: 'idle' | 'syncing' | 'saved' | 'error';
  hideNextButton?: boolean;
};

export default function StepFooter({
  onBack,
  onNext,
  nextDisabled,
  savingState = 'idle',
  hideNextButton,
}: StepFooterProps) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  }, [onBack, router]);

  const statusMessage = (() => {
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
  })();

  return (
    <div className="fixed inset-x-0 bottom-0 border-t bg-white/95 p-3 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-xl border px-3 py-2 text-sm font-medium"
        >
          戻る
        </button>
        <div className="min-h-[1.25rem] text-xs text-gray-500" aria-live="polite">
          {statusMessage}
        </div>
        {!hideNextButton && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            次へ
          </button>
        )}
      </div>
    </div>
  );
}
