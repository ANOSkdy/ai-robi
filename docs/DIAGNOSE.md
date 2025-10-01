# UXギャップ診断レポート

最終更新: 2025-10-01T19:35:37.839Z

| フェーズ | ステータス |
| --- | --- |
| P7 印刷最適化 | 達成 |
| P8 自動保存/バリデーション | 達成 |
| P9 AI生成改善 | 達成 |
| P10 共有リンク | 達成 |
| P11 テンプレ切替 | 未達 |
| P12 i18n/表記 | 未達 |
| P13 画像処理 | 達成 |
| P19 アクセシビリティ | 達成 |
| P20 E2E | 達成 |
| P21 ドキュメント | 達成 |

## 詳細

### P11 テンプレ切替

- ステータス: 未達
- 未達: テンプレート変換 `toResumeData()` が未実装または未使用です。
  - ヒント: `src/templates/toResumeData.ts` などにストアから `ResumeData` を構築する処理を実装してください。

**最有力原因**: 履歴書ストアからテンプレート描画用の `toResumeData()` 変換が未実装です。
提案される擬似パッチ:
```diff
+import { useResumeStore } from "@/store/resume";
+
+export function toResumeData() {
+  const { profile, education, employment, licenses, prText, prAnswers, cv, cvText } = useResumeStore.getState();
+
+  const trimmedPrText = prText.trim();
+  const answers = prAnswers.map((answer) => answer.trim()).filter((answer) => answer.length > 0);
+
+  return {
+    profile: {
+      name: profile.name ?? "", 
+      nameKana: profile.nameKana || undefined,
+      birth: profile.birth || undefined,
+      address: profile.address ?? "", 
+      phone: profile.phone ?? "", 
+      email: profile.email ?? "", 
+      avatarUrl: profile.avatarUrl || undefined,
+    },
+    education: education.map((entry) => ({
+      start: entry.start,
+      end: entry.end || undefined,
+      title: entry.school,
+      detail: entry.degree || undefined,
+      status: entry.status,
+    })),
+    work: employment.map((entry) => ({
+      start: entry.start,
+      end: entry.end || undefined,
+      title: entry.company,
+      detail: entry.role,
+      status: entry.status,
+    })),
+    licenses: licenses.map((entry) => ({
+      name: entry.name,
+      acquiredOn: entry.obtainedOn || undefined,
+    })),
+    pr: trimmedPrText.length > 0 || answers.length > 0 ? {
+      generated: trimmedPrText.length > 0 ? trimmedPrText : undefined,
+      answers: answers.length > 0 ? answers : undefined,
+    } : undefined,
+    career: cvText.trim().length > 0 ? { generatedCareer: cvText.trim() } : undefined,
+  };
+}
```

### P12 i18n/表記

- ステータス: 未達
- 未達: `src/i18n/i18n.tsx` が存在しません (I18nProvider 未実装)。
- 未達: 日本語リソース `src/i18n/ja.json` が存在しません。
- 未達: 英語リソース `src/i18n/en.json` が存在しません。
- 未達: `layout.tsx` で `I18nProvider` によるラップが確認できません。
  - ヒント: src/app/layout.tsx:L12
- 要確認: `t("...")` を利用したラベル表記が十分に検出できません。
  - ヒント: プロフィール・プレビュー画面で翻訳関数を用いた文言化を検討してください。
