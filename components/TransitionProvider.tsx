'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

export default function TransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(REDUCED_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(REDUCED_QUERY);
    const listener = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <div key={pathname} className="animate-fade-slide" aria-live="polite">
      {children}
    </div>
  );
}
