import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

const mergeClassName = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

export default function Section({ title, description, children, className = '' }: SectionProps) {
  return (
    <section className={mergeClassName('mx-auto w-full max-w-screen-md px-4 py-6 sm:px-6 sm:py-8', className)}>
      <header className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl" aria-live="polite">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}
