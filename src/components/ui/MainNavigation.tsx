"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/i18n/i18n";

const NAV_ITEMS = [
  { href: "/resume/profile", labelKey: "nav.profile" },
  { href: "/resume/history", labelKey: "nav.eduwork" },
  { href: "/resume/pr", labelKey: "nav.pr" },
  { href: "/cv", labelKey: "cv.title", fallback: "職務経歴書" },
  { href: "/preview", labelKey: "nav.preview" },
];

const isActive = (pathname: string | null, href: string) => {
  if (!pathname) return false;
  return pathname === href;
};

export function MainNavigation() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav role="navigation" aria-label="主要ナビゲーション" className="flex flex-wrap gap-2 text-sm">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const label = item.labelKey ? t(item.labelKey) : undefined;
        const text =
          item.labelKey && label === item.labelKey && item.fallback
            ? item.fallback
            : label ?? item.fallback ?? "";
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-3 py-1 transition hover:bg-slate-100 ${
              active ? "font-semibold underline" : "text-slate-700"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {text}
          </Link>
        );
      })}
    </nav>
  );
}
