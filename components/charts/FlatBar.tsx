'use client';

import type { ReactNode } from 'react';

const defaultPalette = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-accent-1)',
  'var(--color-accent-2)',
  'var(--color-accent-3)',
];

type FlatBarProps = {
  data: Array<Record<string, number | string>>;
  dataKey?: string;
  nameKey?: string;
  ariaLabel: string;
  colors?: string[];
  className?: string;
  footer?: ReactNode;
};

const mergeClassName = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

export default function FlatBar({
  data,
  dataKey = 'value',
  nameKey = 'name',
  ariaLabel,
  colors = defaultPalette,
  className,
  footer,
}: FlatBarProps) {
  const maxValue = Math.max(
    0,
    ...data.map((item) => {
      const value = Number(item[dataKey]);
      return Number.isFinite(value) ? value : 0;
    })
  );

  return (
    <figure
      role="img"
      aria-label={ariaLabel}
      className={mergeClassName('relative w-full overflow-hidden rounded-3xl bg-white/80 p-4 shadow-soft', className)}
    >
      <div className="grid h-64 w-full grid-cols-[repeat(auto-fit,minmax(64px,1fr))] gap-4">
        {data.map((item, index) => {
          const numericValue = Number(item[dataKey] ?? 0);
          const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
          const ratio = maxValue === 0 ? 0 : safeValue / maxValue;
          const color = colors[index % colors.length];
          return (
            <div key={String(item[nameKey] ?? index)} className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-full w-full items-end overflow-hidden rounded-2xl bg-black/5">
                <span
                  aria-hidden
                  className="w-full rounded-2xl"
                  style={{
                    background: color,
                    height: `${Math.max(ratio * 100, ratio > 0 ? 6 : 2)}%`,
                    transition: 'height 220ms ease-out',
                  }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">{String(item[nameKey])}</span>
              <span className="text-sm font-semibold text-gray-900">{safeValue}</span>
            </div>
          );
        })}
      </div>
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <tbody>
          {data.map((item, index) => (
            <tr key={`row-${index}`}>
              <th scope="row">{String(item[nameKey])}</th>
              <td>{String(item[dataKey])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {footer}
    </figure>
  );
}
