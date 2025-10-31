import React from 'react';
export default function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4.5" fill="currentColor"/>
      <g stroke="currentColor" strokeWidth="2">
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>
      </g>
    </svg>
  );
}
