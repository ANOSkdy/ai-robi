'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

interface StampCardProps {
  title: string;
  description?: string;
  href: string;
  icon?: ReactNode;
  ctaLabel?: string;
}

export default function StampCard({ title, description, href, icon, ctaLabel = 'はじめる' }: StampCardProps) {
  const badge = (
    <span className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white/70 px-4 text-anywhere text-pretty text-xs font-semibold uppercase tracking-[0.2em] text-brand-green1">
      {icon}
      <span>{ctaLabel}</span>
    </span>
  );

  return (
    <Link
      href={href}
      role="link"
      aria-label={title}
      className="group relative flex w-full flex-col gap-4 rounded-[2.5rem] border border-brand-green2/30 bg-paper p-5 shadow-lg ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none sm:p-7"
    >
      <span className="pointer-events-none absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-green2/40 via-brand-earth1/40 to-transparent blur-3xl transition-all duration-500 group-hover:-translate-y-[55%]" aria-hidden />
      <span className="pointer-events-none absolute -left-14 -top-14 h-32 w-32 rotate-12 rounded-[4rem] bg-brand-green2/20 mix-blend-multiply blur-xl" aria-hidden />

      <div className="relative flex flex-col gap-4 text-brand-green1">
        {badge}
        <h2 className="text-anywhere text-balance text-pretty font-semibold leading-snug [font-size:clamp(18px,4.6vw,28px)]">
          {title}
        </h2>
        {description ? (
          <p className="text-anywhere text-pretty leading-relaxed text-brand-earth2/90 [font-size:clamp(14px,3.8vw,17px)]">
            {description}
          </p>
        ) : null}
      </div>

      <div className="relative mt-auto flex items-center gap-3 text-sm font-medium text-brand-green1">
        <span className="inline-flex min-h-[44px] items-center rounded-full border border-brand-earth2/40 bg-white/80 px-4 transition-colors duration-200 group-hover:border-brand-green2/50 group-hover:bg-brand-green2/15">
          {ctaLabel}
        </span>
        <svg
          className="h-6 w-6 text-brand-green1 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </div>
    </Link>
  );
}
