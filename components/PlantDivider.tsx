import React from 'react';
export default function PlantDivider({ tone = 'g2' }: { tone?: 'g1'|'g2'|'e1'|'e2' }) {
  const colorMap = { g1: '#1B512D', g2: '#7FB069', e1: '#E6AA68', e2: '#A67458' } as const;
  const c = colorMap[tone];
  return (
    <div className="eco-divider" aria-hidden="true">
      <svg viewBox="0 0 600 40" width="100%" height="40" style={{ display:'block' }}>
        <defs>
          <linearGradient id="vine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={c} stopOpacity="0.0" />
            <stop offset="40%" stopColor={c} stopOpacity="0.55" />
            <stop offset="100%" stopColor={c} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d="M0 20 C 120 0, 240 40, 360 10 S 520 30, 600 18" fill="none" stroke="url(#vine)" strokeWidth="3" strokeLinecap="round"/>
        <g fill={c} opacity=".7">
          <path d="M120 14c8 0 14 6 14 14-8 2-14-4-14-14Z" />
          <path d="M260 28c-8 0-14-6-14-14 8-2 14 4 14 14Z" />
          <path d="M420 12c8 0 14 6 14 14-8 2-14-4-14-14Z" />
        </g>
      </svg>
    </div>
  );
}
