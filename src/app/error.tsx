"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const showDebug =
    typeof window !== "undefined" && new URL(window.location.href).searchParams.get("debug") === "1";

  return (
    <html>
      <body>
        <div
          style={{
            maxWidth: 720,
            margin: "10vh auto",
            padding: "1rem",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "#fff",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: 8 }}>
            エラーが発生しました
          </h1>
          <p style={{ margin: "8px 0 16px", color: "#374151" }}>
            一時的な問題の可能性があります。再読み込みをお試しください。
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: showDebug ? 12 : 0 }}>
            <button onClick={() => location.reload()} className="btn">
              再読み込み
            </button>
            <button onClick={reset} className="btn">
              もう一度試す
            </button>
          </div>
          {showDebug ? (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 12,
                background: "#f9fafb",
                padding: 12,
                borderRadius: 8,
                overflow: "auto",
              }}
            >
              {error?.message ?? "no message"}
              {"\n"}
              {error?.stack ?? "no stack"}
            </pre>
          ) : null}
        </div>
      </body>
    </html>
  );
}
