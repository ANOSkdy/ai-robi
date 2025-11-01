import type { SVGProps } from 'react';

export default function LeafIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable={false} {...props}>
      <path d="M3 12c0 5.523 3.477 9 9 9s9-3.477 9-9C21 5.477 12 3 12 3s-9 2.477-9 9Z" />
      <path d="M12 22c-2-4-2-10 0-13" />
    </svg>
  );
}
