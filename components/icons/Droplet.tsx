import type { SVGProps } from 'react';

export default function DropletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable={false} {...props}>
      <path d="M12 2s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z" />
    </svg>
  );
}
