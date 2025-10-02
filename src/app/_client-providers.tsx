"use client";

import React from "react";

import { I18nProvider } from "@/i18n/i18n";

/**
 * Client-only provider wrapper to host all stateful providers.
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
