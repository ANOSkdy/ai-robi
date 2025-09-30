"use client";
import { useState } from "react";

type Props = {
  endpoint: "/api/ai/generate-resume" | "/api/ai/generate-career";
  payload: unknown;
  onApply: (text: string) => void;
  buttonLabel?: string;
};

export default function AIGeneratePanel({ endpoint, payload, onApply, buttonLabel = "AI生成" }: Props) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: { result?: string; error?: unknown } = await response.json();
      if (!response.ok) {
        throw new Error(typeof json.error === "string" ? json.error : "AI生成に失敗しました");
      }
      setDraft(String(json.result ?? ""));
    } catch (error_) {
      const message = error_ instanceof Error ? error_.message : "AI生成に失敗しました";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 rounded border border-slate-200 p-3">
      <div className="flex items-center gap-2">
        <button type="button" className="rounded border px-3 py-2" onClick={handleGenerate} disabled={loading}>
          {loading ? "生成中…" : buttonLabel}
        </button>
        {error ? <span className="text-sm text-red-600" role="alert">{error}</span> : null}
      </div>

      {draft ? (
        <div className="space-y-2">
          <label htmlFor={`${endpoint}-draft`} className="sr-only">
            生成結果の編集内容
          </label>
          <textarea
            id={`${endpoint}-draft`}
            className="min-h-[200px] w-full rounded border border-slate-300 p-2 text-sm"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded border px-3 py-2" onClick={() => setDraft("")}>
              クリア
            </button>
            <button type="button" className="rounded border px-3 py-2" onClick={() => onApply(draft)}>
              この内容を反映
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
