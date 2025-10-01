"use client";

import { useI18n } from "@/i18n/i18n";
import type { Lang } from "@/i18n/types";

export function LangSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-2 text-sm" data-hide-on-print>
      <label className="font-medium text-slate-700" htmlFor="language-select">
        Lang
      </label>
      <select
        id="language-select"
        className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        value={lang}
        onChange={(event) => setLang(event.target.value as Lang)}
        aria-label="Change language"
      >
        <option value="ja">日本語</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}

export default LangSwitcher;
