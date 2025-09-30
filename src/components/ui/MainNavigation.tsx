"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/resume/profile", label: "履歴書（プロフィール）" },
  { href: "/resume/history", label: "履歴書（学歴・職歴・資格）" },
  { href: "/resume/pr", label: "履歴書（自己PR）" },
  { href: "/cv", label: "職務経歴書" },
  { href: "/preview", label: "プレビュー" },
];

const isActive = (pathname: string | null, href: string) => {
  if (!pathname) return false;
  return pathname === href;
};

export function MainNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="主要ナビゲーション" className="flex flex-wrap gap-2 text-sm">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-3 py-1 transition hover:bg-slate-100 ${
              active ? "font-semibold underline" : "text-slate-700"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
