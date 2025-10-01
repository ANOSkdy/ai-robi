# 開発者ガイド

## セットアップ

```bash
pnpm i
pnpm dev
```

必須: `.env` を `.env.local` にコピーし、キーを設定

## 主な技術

- Next.js (App Router) / TypeScript / Tailwind
- Zod（フォームバリデーション）
- Zustand（状態管理）
- 共有: Vercel KV
- AI: Gemini API

## コード規約

- 型安全（`any` は極力禁止）
- UI はアクセシビリティを優先（`label` / `aria-*` / `:focus-visible`）
- 共有/印刷/テンプレは副作用を最小化し、再利用可能な関数に分離

## テスト

- E2E は Playwright 雛形を `tests/e2e` に配置（ローカル前提）
- 依存は CI に含めないため、手元で必要時に `pnpm add -D @playwright/test cross-env` を実行ください

## よく使うスクリプト

```bash
pnpm dev        # 開発サーバ
pnpm build      # 本番ビルド
# E2E（ローカル/任意依存）
pnpm test:e2e   # 事前に devDeps をローカル追加してください
```

## 構成図（簡易）

```
[UI] -> hooks/store -> lib(validate/ai/image/notation)
  |                -> templates (preview/print)
  |-> api (ai/*, share/*) -> KV / Gemini
```
