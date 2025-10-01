# 運用ガイド（管理）

## 環境変数

- `GEMINI_API_KEY` … AI 生成
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` … 共有リンク
- `NEXT_PUBLIC_APP_URL` … 共有URLのオリジン指定（任意）

## デプロイ

- Vercel 推奨。`pnpm install` → `pnpm build`。
- CI は frozen-lockfile のため、lockfile を変更しない方針。開発用依存はローカルに限定。

## 監査ログ/監視

- 本リリースでは未実装（P18 除外）。Vercel の標準ログをご利用ください。

## セキュリティ

- 共有リンクはトークン＋期限。機密度が高い場合は公開を控え、PDFでの直接共有を推奨。
