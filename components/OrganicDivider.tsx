import type { HTMLAttributes } from 'react';

interface OrganicDividerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'vine' | 'hand';
}

export default function OrganicDivider({ variant = 'vine', className = '', ...props }: OrganicDividerProps) {
  const classes = ['w-full', 'overflow-hidden', className].filter(Boolean).join(' ');
  if (variant === 'hand') {
    return (
      <div className={classes} aria-hidden {...props}>
        <svg viewBox="0 0 600 60" xmlns="http://www.w3.org/2000/svg" className="h-12 w-full">
          <path
            d="M8 38 C 72 22, 130 50, 204 30 S 360 12, 410 36 540 28, 592 22"
            fill="none"
            stroke="url(#handGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 28"
          />
          <defs>
            <linearGradient id="handGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#A67458" stopOpacity="0.15" />
              <stop offset="40%" stopColor="#1B512D" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#7FB069" stopOpacity="0.25" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className={classes} aria-hidden {...props}>
      <svg viewBox="0 0 600 60" xmlns="http://www.w3.org/2000/svg" className="h-12 w-full">
        <defs>
          <linearGradient id="vineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1B512D" stopOpacity="0.1" />
            <stop offset="45%" stopColor="#7FB069" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#E6AA68" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <path
          d="M0 34 C 110 10, 160 58, 260 32 S 420 4, 520 36 600 28, 600 28"
          fill="none"
          stroke="url(#vineGradient)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <g fill="#7FB069" opacity="0.7">
          <path d="M120 28c10-6 20 2 18 12-10 4-18-4-18-12Z" />
          <path d="M310 22c-10 6-20-2-18-12 10-4 18 4 18 12Z" />
          <path d="M470 38c10-6 20 2 18 12-10 4-18-4-18-12Z" />
        </g>
      </svg>
    </div>
  );
}
