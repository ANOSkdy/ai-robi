import type { ReactNode } from "react";

export function ErrorBanner({ message, icon }: { message: string; icon?: ReactNode }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {icon}
      <span>{message}</span>
    </div>
  );
}
