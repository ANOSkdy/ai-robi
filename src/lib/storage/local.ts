"use client";

const PREFIX = "ai-robi:v1:";

export function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

export function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch {}
}

export function useAutosave<T>(key: string, state: T, deps: any[] = []) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const React = require("react");
  React.useEffect(() => { save(key, state); }, deps);
}
