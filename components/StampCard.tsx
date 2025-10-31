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
    <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-green1">
      {icon}
      <span>{ctaLabel}</span>
    </span>
  );

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-[2.5rem] border border-brand-green2/30 bg-paper p-8 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none"
    >
      <span className="pointer-events-none absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-green2/40 via-brand-earth1/40 to-transparent blur-3xl transition-all duration-500 group-hover:-translate-y-[55%]" />
      <span className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rotate-12 rounded-[4rem] bg-brand-green2/20 mix-blend-multiply blur-xl" />
      <div className="relative grid gap-6">
        <div className="flex items-start justify-between gap-6">
          <div className="grid gap-3">
            {badge}
            <h2 className="text-3xl font-semibold tracking-tight text-brand-green1 sm:text-[2.35rem]">
              {title}
            </h2>
            {description ? (
              <p className="max-w-[32ch] text-base leading-relaxed text-brand-earth2/90">
                {description}
              </p>
            ) : null}
          </div>
          <div className="leaf-clip-a relative hidden h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-earth1/60 to-brand-green2/40 text-brand-green1 shadow-xl sm:flex">
            <span className="leaf-clip-b absolute inset-1 bg-white/40" />
            <span className="relative text-sm font-semibold tracking-widest text-brand-green1/80">GO</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm font-medium text-brand-green1">
          <span className="inline-flex h-10 items-center rounded-full border border-brand-earth2/40 bg-white/70 px-4 transition-colors duration-200 group-hover:border-brand-green2/50 group-hover:bg-brand-green2/15">
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
      </div>
    </Link>
  );
}
