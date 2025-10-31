'use client';

type ProgressBarProps = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.min(100, Math.round((current / safeTotal) * 100));

  return (
    <div aria-label="進捗" className="w-full">
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium">進行度</span>
        <span aria-live="polite">{current}/{total}（{pct}%）</span>
      </div>
      <div className="h-2 w-full rounded bg-gray-200">
        <div className="h-2 rounded bg-black transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
