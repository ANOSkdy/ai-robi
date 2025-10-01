"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import en from "./en.json";
import ja from "./ja.json";
import type { Lang, Messages } from "./types";

const MESSAGES: Record<Lang, Messages> = { ja, en };
const LANG_COOKIE = "lang";

const getCookieValue = (name: string): string | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }
  const entry = document.cookie.split("; ").find((item) => item.startsWith(`${name}=`));
  return entry?.split("=")[1];
};

type I18nContextValue = {
  lang: Lang;
  t: (key: string) => string;
  setLang: (lang: Lang) => void;
};

const I18nContext = createContext<I18nContextValue>({ lang: "ja", t: (key) => key, setLang: () => undefined });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ja");

  useEffect(() => {
    const qs = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : undefined;
    const queryLang = qs?.get("lang");
    const cookieLang = getCookieValue(LANG_COOKIE);
    const initial = [queryLang, cookieLang].find((value): value is Lang => value === "ja" || value === "en") ?? "ja";
    setLang(initial);
  }, []);

  const updateLang = useCallback((next: Lang) => {
    setLang(next);
    if (typeof document !== "undefined") {
      document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000`;
    }
  }, []);

  const translate = useCallback(
    (key: string) => {
      const message = MESSAGES[lang]?.[key];
      return message ?? key;
    },
    [lang],
  );

  const value = useMemo(
    () => ({
      lang,
      t: translate,
      setLang: updateLang,
    }),
    [lang, translate, updateLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
