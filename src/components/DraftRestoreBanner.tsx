"use client";

import { useState } from "react";

type DraftState<T> = {
  data?: T;
  ts?: number;
};

type Props<T> = {
  draft?: DraftState<T>;
  onRestore: (data: T) => void;
  onDiscard: () => void;
};

export function DraftRestoreBanner<T>({ draft, onRestore, onDiscard }: Props<T>) {
  const [closed, setClosed] = useState(false);
  if (!draft?.data || closed) return null;

  const date = draft.ts ? new Date(draft.ts).toLocaleString() : "";

  const handleRestore = () => {
    onRestore(draft.data as T);
    setClosed(true);
  };

  const handleDiscard = () => {
    onDiscard();
    setClosed(true);
  };

  return (
    <div className="mb-3 flex items-center gap-3 rounded border bg-yellow-50 p-3 text-sm" role="status" aria-live="polite">
      <span>前回の入力内容（{date} 保存）を復元しますか？</span>
      <div className="ml-auto flex gap-2">
        <button
          type="button"
          className="rounded border px-2 py-1"
          onClick={handleRestore}
          aria-label="前回の入力内容を復元する"
        >
          復元
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1"
          onClick={handleDiscard}
          aria-label="保存済みの下書きを破棄する"
        >
          破棄
        </button>
      </div>
    </div>
  );
}
