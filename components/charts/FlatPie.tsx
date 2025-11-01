'use client';

import type { ReactNode } from 'react';

const defaultPalette = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-accent-1)',
  'var(--color-accent-2)',
  'var(--color-accent-3)',
];

type FlatPieProps = {
  data: Array<Record<string, number | string>>;
  dataKey?: string;
  nameKey?: string;
  ariaLabel: string;
  colors?: string[];
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
  footer?: ReactNode;
};

const mergeClassName = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

export default function FlatPie({
  data,
  dataKey = 'value',
  nameKey = 'name',
  ariaLabel,
  colors = defaultPalette,
  className,
  innerRadius = 36,
  outerRadius = 60,
  footer,
}: FlatPieProps) {
  const total = data.reduce((sum, item) => {
    const value = Number(item[dataKey]);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
  const circumference = 2 * Math.PI * outerRadius;
  const segments = data.reduce(
    (
      acc,
      item,
      index
    ): {
      segments: Array<{
        dash: number;
        offset: number;
        color: string;
        name: string;
        value: number;
        ratio: number;
      }>;
      sum: number;
    } => {
      const value = Number(item[dataKey] ?? 0);
      const safeValue = Number.isFinite(value) ? value : 0;
      const ratio = total === 0 ? 0 : safeValue / total;
      const dash = ratio * circumference;
      const offset = -acc.sum * circumference;
      return {
        segments: [
          ...acc.segments,
          {
            dash,
            offset,
            color: colors[index % colors.length],
            name: String(item[nameKey]),
            value: safeValue,
            ratio,
          },
        ],
        sum: acc.sum + ratio,
      };
    },
    { segments: [], sum: 0 }
  ).segments;

  return (
    <figure
      role="img"
      aria-label={ariaLabel}
      className={mergeClassName('relative w-full overflow-hidden rounded-3xl bg-white/80 p-4 shadow-soft', className)}
    >
      <div className="flex flex-col items-center gap-4">
        <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden>
          <g transform="translate(110,110) rotate(-90)">
            <circle
              r={outerRadius}
              fill="none"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth={outerRadius - innerRadius}
            />
            {segments.map((segment, index) => (
              <circle
                key={`slice-${index}`}
                r={outerRadius}
                fill="none"
                stroke={segment.color}
                strokeWidth={outerRadius - innerRadius}
                strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
                strokeDashoffset={segment.offset}
                strokeLinecap="round"
              />
            ))}
          </g>
        </svg>
        <div className="grid w-full gap-2 text-sm text-gray-700">
          {segments.map((segment, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-3">
              <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: segment.color }} />
              <span className="flex-1 truncate">{segment.name}</span>
              <span className="tabular-nums text-gray-500">{segment.value}</span>
              <span className="tabular-nums text-gray-400">{total === 0 ? 0 : Math.round(segment.ratio * 100)}%</span>
            </div>
          ))}
        </div>
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
