import type { SVGProps } from 'react';

export default function RecycleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable={false} {...props}>
      <path d="m7 9 5-6 3 6" />
      <path d="M6 15H3l1.5-3" />
      <path d="m17 15-5 6-3-6" />
      <path d="M18 9h3l-1.5 3" />
      <path d="M8 22H4l1.5-3" />
    </svg>
  );
}
