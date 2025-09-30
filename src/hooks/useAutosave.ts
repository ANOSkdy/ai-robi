"use client";

import { useEffect, useRef } from "react";

type Options<T> = {
  key: string;
  data: T;
  delay?: number;
  enabled?: boolean;
};

type DraftPayload<T> = {
  v: number;
  t: number;
  data: T;
};

export function useAutosave<T>({ key, data, delay = 800, enabled = true }: Options<T>) {
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return undefined;

    if (timer.current !== null) {
      window.clearTimeout(timer.current);
    }

    timer.current = window.setTimeout(() => {
      try {
        const payload: DraftPayload<T> = { v: 1, t: Date.now(), data };
        localStorage.setItem(key, JSON.stringify(payload));
      } catch {
        // noop
      }
    }, delay);

    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    };
  }, [data, delay, enabled, key]);
}

export function loadDraft<T>(key: string): { data?: T; ts?: number } {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<DraftPayload<T>> | null;
    if (!parsed || typeof parsed !== "object") return {};
    const data = "data" in parsed ? (parsed.data as T | undefined) : undefined;
    const ts = typeof parsed?.t === "number" ? parsed.t : undefined;
    return { data, ts };
  } catch {
    return {};
  }
}

export function clearDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
}
