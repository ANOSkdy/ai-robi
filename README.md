# AI-ROBI

AI-ROBI は、履歴書/職務経歴書の作成を支援する Next.js アプリです。
**P7〜P13, P19, P20** を実装済みで、印刷最適化・テンプレ切替・i18n・写真トリミング・共有リンク・E2E 基本テストを備えています。
※ 管理画面・認証・下書きサーバ同期・監視（P14〜P18）は **当面対象外** です。

## クイックスタート（開発）

```bash
pnpm i
pnpm dev
# http://localhost:3000
```

必須環境変数

- `GEMINI_API_KEY` : AI生成（自己PR/職務経歴）
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` : 共有リンク（P10）

`.env.example` を参照してください。

## 機能ハイライト

- 印刷最適化 (P7): ブラウザ印刷でPDF出力/改ページ制御
- フォーム自動保存・Zodバリデーション (P8)
- AI生成テンプレ最適化 (P9)
- 共有リンク（署名トークン/期限） (P10)
- テンプレ切替（standard/jis/company-simple） (P11)
- i18n（ja/en）・かな/ローマ字補助 (P12)
- 写真 4:3 トリミング＆圧縮 (P13)
- アクセシビリティ改善 (P19)
- E2E テスト雛形（ローカル実行前提） (P20)

## ディレクトリ構成（抜粋）

```
src/
  app/                # Next.js App Router
    preview/          # プレビュー/印刷
    share/            # 共有閲覧
    api/              # APIルート
  components/         # UIコンポーネント
  templates/          # テンプレレイアウト
  i18n/               # 多言語
  hooks/ lib/ store/  # フック・共通処理・状態

tests/
  e2e/                # Playwright（ローカル実行）
```

## よくある質問

**Q: 認証は？**
A: 現時点のスコープ外（P15除外）。共有リンクはトークンベースの閲覧専用です。

**Q: サーバPDFやDOCX出力は？**
A: ブラウザ印刷（P7）で代替。拡張（P16）は未実施。

**Q: テストは？**
A: E2E 雛形を提供（P20）。CI では実行しません（依存の都合上）。

関連ドキュメント: [USER_GUIDE.md](docs/USER_GUIDE.md) / [ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) / [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) / [CONTRIBUTING.md](CONTRIBUTING.md) / [CHANGELOG.md](CHANGELOG.md)
