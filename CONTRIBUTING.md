# Contributing

1. Issue/PR のタイトルは `[feat|fix|chore|docs]` を先頭に付けてください。
2. 1PR=1トピック。UI/ロジック/スタイルの混在を避けます。
3. 依存追加は lockfile も含めて検討。CI は frozen-lockfile です。
4. 既存の i18n/A11y/印刷最適化を壊さないように。
5. テスト（任意）: ローカルで Playwright を導入して実行してください（CI では未実行）。
