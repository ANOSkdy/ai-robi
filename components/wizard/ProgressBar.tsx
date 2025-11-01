'use client';

type ProgressBarProps = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.max(0, Math.min(100, Math.round((current / safeTotal) * 100)));

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-sm text-[color:rgb(var(--muted-fg))]">
        <span className="font-medium text-[color:rgb(var(--fg))]">進行度</span>
        <span aria-live="polite">{current}/{total}（{pct}%）</span>
      </div>
      <div
        className="h-2 w-full rounded bg-[rgba(0,0,0,0.06)]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${current}/${total}`}
        aria-label="進捗"
      >
        <div
          className="h-2 rounded bg-[color:var(--color-primary)] transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
