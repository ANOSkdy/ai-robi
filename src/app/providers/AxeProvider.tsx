"use client";

import { useEffect } from "react";

export default function AxeProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }

    let cancelled = false;

    void Promise.all([
      import("@axe-core/react"),
      import("react"),
      import("react-dom"),
    ])
      .then(([axeModule, reactModule, reactDomModule]) => {
        if (cancelled) return;
        const axe = axeModule.default;
        if (typeof axe !== "function") {
          return;
        }
        axe(reactModule, reactDomModule, 1000);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
