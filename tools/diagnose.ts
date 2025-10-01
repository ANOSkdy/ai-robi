const { promises: fs } = require("fs");
const path = require("path");

/**
 * @typedef {"FAIL" | "WARN"} Severity
 * @typedef {"PASS" | "WARN" | "FAIL"} Status
 * @typedef {{severity: Severity, message: string, hints?: string[]}} Finding
 * @typedef {{id: string, title: string, status: Status, findings: Finding[]}} PhaseResult
 * @typedef {Object} DiagnoseContext
 * @property {string} rootDir
 * @property {(relativePath: string) => Promise<string | null>} readFile
 * @property {(relativePath: string) => Promise<boolean>} fileExists
 * @property {string[]} sourceFiles
 * @property {(pattern: RegExp) => Promise<string[]>} searchSource
 * @property {(files: string[], patterns: RegExp[]) => Promise<string[]>} findFilesWithAllPatterns
 * @property {(relativePath: string, snippet: string) => Promise<string>} toLineReference
 */

/** @type {Record<Status, string>} */
const SUMMARY_STATUS_LABEL = {
  PASS: "達成",
  WARN: "要確認",
  FAIL: "未達",
};

/** @type {Record<Severity, string>} */
const DETAIL_SEVERITY_LABEL = {
  FAIL: "未達",
  WARN: "要確認",
};

async function main() {
  const ctx = await createContext();

  const phases = [
    await checkP7(ctx),
    await checkP8(ctx),
    await checkP9(ctx),
    await checkP10(ctx),
    await checkP11(ctx),
    await checkP12(ctx),
    await checkP13(ctx),
    await checkP19(ctx),
    await checkP20(ctx),
    await checkP21(ctx),
  ];

  const markdown = renderReport(phases);
  const reportPath = path.join(ctx.rootDir, "docs", "DIAGNOSE.md");
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, markdown, "utf8");
  // eslint-disable-next-line no-console
  console.log(`診断レポートを生成しました: ${path.relative(ctx.rootDir, reportPath)}`);
}

/**
 * @returns {Promise<DiagnoseContext>}
 */
async function createContext() {
  const rootDir = path.resolve(__dirname, "..");
  const fileContentCache = new Map();
  const fileExistsCache = new Map();

  const readFile = async (relativePath) => {
    if (fileContentCache.has(relativePath)) {
      return fileContentCache.get(relativePath) ?? null;
    }
    const absolutePath = path.join(rootDir, relativePath);
    try {
      const content = await fs.readFile(absolutePath, "utf8");
      fileContentCache.set(relativePath, content);
      fileExistsCache.set(relativePath, true);
      return content;
    } catch (error) {
      fileExistsCache.set(relativePath, false);
      return null;
    }
  };

  const fileExists = async (relativePath) => {
    if (fileExistsCache.has(relativePath)) {
      return fileExistsCache.get(relativePath) ?? false;
    }
    const absolutePath = path.join(rootDir, relativePath);
    try {
      await fs.access(absolutePath);
      fileExistsCache.set(relativePath, true);
      return true;
    } catch (error) {
      fileExistsCache.set(relativePath, false);
      return false;
    }
  };

  const sourceFiles = await collectFiles(rootDir, "src", new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".json"]));

  const searchSource = async (pattern) => {
    const matches = [];
    const regex = new RegExp(pattern.source, pattern.flags);
    for (const file of sourceFiles) {
      const content = await readFile(file);
      if (!content) continue;
      regex.lastIndex = 0;
      if (regex.test(content)) {
        matches.push(file);
      }
    }
    return matches;
  };

  const findFilesWithAllPatterns = async (files, patterns) => {
    const results = [];
    for (const file of files) {
      const content = await readFile(file);
      if (!content) continue;
      let matchedAll = true;
      for (const pattern of patterns) {
        const regex = new RegExp(pattern.source, pattern.flags);
        regex.lastIndex = 0;
        if (!regex.test(content)) {
          matchedAll = false;
          break;
        }
      }
      if (matchedAll) {
        results.push(file);
      }
    }
    return results;
  };

  const toLineReference = async (relativePath, snippet) => {
    const content = await readFile(relativePath);
    if (!content) {
      return relativePath;
    }
    const index = content.indexOf(snippet);
    if (index === -1) {
      return relativePath;
    }
    const prefix = content.slice(0, index);
    const line = prefix.split(/\r?\n/).length;
    return `${relativePath}:L${line}`;
  };

  return {
    rootDir,
    readFile,
    fileExists,
    sourceFiles,
    searchSource,
    findFilesWithAllPatterns,
    toLineReference,
  };
}

async function collectFiles(rootDir, relativeDir, extensions) {
  const targetDir = path.join(rootDir, relativeDir);
  try {
    await fs.access(targetDir);
  } catch (error) {
    return [];
  }

  const results = [];
  const skipDirs = new Set([".git", "node_modules", ".next", ".turbo", "out", "dist", "build", "coverage"]);

  const walk = async (currentDir) => {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isSymbolicLink()) {
        continue;
      }
      const absolutePath = path.join(currentDir, entry.name);
      const relativePath = path.relative(rootDir, absolutePath);
      if (entry.isDirectory()) {
        if (skipDirs.has(entry.name)) {
          continue;
        }
        await walk(absolutePath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.size === 0 || extensions.has(ext)) {
          results.push(relativePath);
        }
      }
    }
  };

  await walk(targetDir);
  return results;
}

/**
 * @param {Finding[]} findings
 * @returns {Status}
 */
function determineStatus(findings) {
  if (findings.some((finding) => finding.severity === "FAIL")) {
    return "FAIL";
  }
  if (findings.some((finding) => finding.severity === "WARN")) {
    return "WARN";
  }
  return "PASS";
}

/**
 * @param {PhaseResult[]} phases
 */
function renderReport(phases) {
  const lines = [];
  const now = new Date().toISOString();
  lines.push("# UXギャップ診断レポート");
  lines.push("");
  lines.push(`最終更新: ${now}`);
  lines.push("");
  lines.push("| フェーズ | ステータス |");
  lines.push("| --- | --- |");
  for (const phase of phases) {
    lines.push(`| ${phase.id} ${phase.title} | ${SUMMARY_STATUS_LABEL[phase.status]} |`);
  }
  lines.push("");

  const detailed = phases.filter((phase) => phase.findings.length > 0);
  if (detailed.length > 0) {
    lines.push("## 詳細");
    lines.push("");
  }

  for (const phase of detailed) {
    lines.push(`### ${phase.id} ${phase.title}`);
    lines.push("");
    lines.push(`- ステータス: ${SUMMARY_STATUS_LABEL[phase.status]}`);
    for (const finding of phase.findings) {
      lines.push(`- ${DETAIL_SEVERITY_LABEL[finding.severity]}: ${finding.message}`);
      if (finding.hints && finding.hints.length > 0) {
        for (const hint of finding.hints) {
          lines.push(`  - ヒント: ${hint}`);
        }
      }
    }

    if (phase.id === "P11" && phase.findings.some((finding) => finding.message.includes("toResumeData"))) {
      lines.push("");
      lines.push("**最有力原因**: 履歴書ストアからテンプレート描画用の `toResumeData()` 変換が未実装です。");
      lines.push("提案される擬似パッチ:");
      lines.push("```diff");
      lines.push("+import { useResumeStore } from \"@/store/resume\";");
      lines.push("+");
      lines.push("+export function toResumeData() {");
      lines.push("+  const { profile, education, employment, licenses, prText, prAnswers, cv, cvText } = useResumeStore.getState();");
      lines.push("+");
      lines.push("+  const trimmedPrText = prText.trim();");
      lines.push("+  const answers = prAnswers.map((answer) => answer.trim()).filter((answer) => answer.length > 0);");
      lines.push("+");
      lines.push("+  return {");
      lines.push("+    profile: {");
      lines.push("+      name: profile.name ?? \"\", ");
      lines.push("+      nameKana: profile.nameKana || undefined,");
      lines.push("+      birth: profile.birth || undefined,");
      lines.push("+      address: profile.address ?? \"\", ");
      lines.push("+      phone: profile.phone ?? \"\", ");
      lines.push("+      email: profile.email ?? \"\", ");
      lines.push("+      avatarUrl: profile.avatarUrl || undefined,");
      lines.push("+    },");
      lines.push("+    education: education.map((entry) => ({");
      lines.push("+      start: entry.start,");
      lines.push("+      end: entry.end || undefined,");
      lines.push("+      title: entry.school,");
      lines.push("+      detail: entry.degree || undefined,");
      lines.push("+      status: entry.status,");
      lines.push("+    })),");
      lines.push("+    work: employment.map((entry) => ({");
      lines.push("+      start: entry.start,");
      lines.push("+      end: entry.end || undefined,");
      lines.push("+      title: entry.company,");
      lines.push("+      detail: entry.role,");
      lines.push("+      status: entry.status,");
      lines.push("+    })),");
      lines.push("+    licenses: licenses.map((entry) => ({");
      lines.push("+      name: entry.name,");
      lines.push("+      acquiredOn: entry.obtainedOn || undefined,");
      lines.push("+    })),");
      lines.push("+    pr: trimmedPrText.length > 0 || answers.length > 0 ? {");
      lines.push("+      generated: trimmedPrText.length > 0 ? trimmedPrText : undefined,");
      lines.push("+      answers: answers.length > 0 ? answers : undefined,");
      lines.push("+    } : undefined,");
      lines.push("+    career: cvText.trim().length > 0 ? { generatedCareer: cvText.trim() } : undefined,");
      lines.push("+  };");
      lines.push("+}");
      lines.push("```");
    }

    lines.push("");
  }

  return lines.join("\n");
}

/**
 * @param {DiagnoseContext} ctx
 * @returns {Promise<PhaseResult>}
 */
async function checkP7(ctx) {
  const findings = [];
  const printCssPath = "src/styles/print.css";
  const printCssExists = await ctx.fileExists(printCssPath);
  if (!printCssExists) {
    findings.push({
      severity: "FAIL",
      message: "印刷用スタイルシート `src/styles/print.css` が見つかりません。",
    });
  } else {
    const content = await ctx.readFile(printCssPath);
    if (!content || !/@media\s+print/.test(content)) {
      findings.push({
        severity: "FAIL",
        message: "`src/styles/print.css` に `@media print` セクションがありません。",
        hints: [await ctx.toLineReference(printCssPath, "@media print")],
      });
    }
    if (!content || (!/\.avoid-break/.test(content) && !/data-hide-on-print/.test(content))) {
      findings.push({
        severity: "WARN",
        message: "`src/styles/print.css` に `.avoid-break` または `[data-hide-on-print]` の指定が確認できません。",
        hints: [await ctx.toLineReference(printCssPath, "avoid-break")],
      });
    }
  }

  const previewPath = "src/app/preview/page.tsx";
  const previewContent = await ctx.readFile(previewPath);
  if (!previewContent) {
    findings.push({
      severity: "FAIL",
      message: "プレビュー画面 `src/app/preview/page.tsx` が見つかりません。",
    });
  } else if (!/useReactToPrint/.test(previewContent) && !/window\.print\(\)/.test(previewContent)) {
    findings.push({
      severity: "FAIL",
      message: "`src/app/preview/page.tsx` に印刷トリガー (`useReactToPrint` または `window.print`) がありません。",
    });
  }

  return { id: "P7", title: "印刷最適化", status: determineStatus(findings), findings };
}

/**
 * @param {DiagnoseContext} ctx
 * @returns {Promise<PhaseResult>}
 */
async function checkP8(ctx) {
  const findings = [];

  const zodUsageFiles = await ctx.findFilesWithAllPatterns(ctx.sourceFiles, [
    /import\s+{[^}]*\bz\b[^}]*}\s+from\s+["']zod["']/,
    /z\.object\s*\(/,
  ]);
  if (zodUsageFiles.length === 0) {
    findings.push({
      severity: "FAIL",
      message: "Zod スキーマと `z.object` を併用したフォームバリデーションが検出できません。",
      hints: ["src/app/resume/profile/schema.ts などに実装を追加してください。"],
    });
  }

  const persistMatches = await ctx.searchSource(/airobi:/);
  const hasPersist = persistMatches.some((file) => file.includes("store") || file.includes("resume"));
  if (!hasPersist) {
    findings.push({
      severity: "FAIL",
      message: "LocalStorage/Zustand の `name: \"airobi:\"` プレフィックスが見つかりません。",
      hints: ["zustand persist 設定に `name: \"airobi:...\"` を設定してください。"],
    });
  }

  return { id: "P8", title: "自動保存/バリデーション", status: determineStatus(findings), findings };
}

/**
 * @param {DiagnoseContext} ctx
 * @returns {Promise<PhaseResult>}
 */
async function checkP9(ctx) {
  const findings = [];

  const resumeRoutePath = "src/app/api/ai/generate-resume/route.ts";
  if (!(await ctx.fileExists(resumeRoutePath))) {
    findings.push({
      severity: "FAIL",
      message: "`/api/ai/generate-resume` のルートファイルが存在しません。",
    });
  } else {
    const content = await ctx.readFile(resumeRoutePath);
    if (!content || !/z\w*\.safeParse|z\.object/.test(content)) {
      findings.push({
        severity: "WARN",
        message: "`generate-resume` ルートで Zod による入力検証が確認できません。",
        hints: [await ctx.toLineReference(resumeRoutePath, "safeParse")],
      });
    }
  }

  const careerRoutePath = "src/app/api/ai/generate-career/route.ts";
  if (!(await ctx.fileExists(careerRoutePath))) {
    findings.push({
      severity: "FAIL",
      message: "`/api/ai/generate-career` のルートファイルが存在しません。",
    });
  } else {
    const content = await ctx.readFile(careerRoutePath);
    if (!content || !/z\w*\.safeParse|z\.object/.test(content)) {
      findings.push({
        severity: "WARN",
        message: "`generate-career` ルートで Zod による入力検証が確認できません。",
        hints: [await ctx.toLineReference(careerRoutePath, "safeParse")],
      });
    }
  }

  const templateMatches = await ctx.searchSource(/USER_TEMPLATE|CAREER_TEMPLATE/);
  if (templateMatches.length === 0) {
    findings.push({
      severity: "WARN",
      message: "AI プロンプトテンプレート (`USER_TEMPLATE` / `CAREER_TEMPLATE` 系) が見つかりません。",
      hints: ["src/lib/ai/templates/ 配下にテンプレートを実装してください。"],
    });
  }

  return { id: "P9", title: "AI生成改善", status: determineStatus(findings), findings };
}

/**
 * @param {DiagnoseContext} ctx
 * @returns {Promise<PhaseResult>}
 */
async function checkP10(ctx) {
  const findings = [];
  const sharePostPath = "src/app/api/share/route.ts";
  const shareGetPath = "src/app/api/share/[token]/route.ts";
  const sharePagePath = "src/app/share/[token]/page.tsx";

  if (!(await ctx.fileExists(sharePostPath))) {
    findings.push({ severity: "FAIL", message: "共有リンク発行の POST ルートが存在しません。" });
  } else {
    const content = await ctx.readFile(sharePostPath);
    if (!content || !/NextRequest/.test(content) || !/NextResponse/.test(content)) {
      findings.push({
        severity: "WARN",
        message: "共有リンク POST ルートで NextRequest/NextResponse の利用が確認できません。",
        hints: [await ctx.toLineReference(sharePostPath, "NextRequest")],
      });
    }
    if (!content || (!/nextUrl\.origin/.test(content) && !/NEXT_PUBLIC_APP_URL/.test(content))) {
      findings.push({
        severity: "WARN",
        message: "共有リンク URL 生成時に `request.nextUrl.origin` または `NEXT_PUBLIC_APP_URL` を参照していません。",
        hints: [await ctx.toLineReference(sharePostPath, "origin")],
      });
    }
  }

  if (!(await ctx.fileExists(shareGetPath))) {
    findings.push({ severity: "FAIL", message: "共有リンク参照の GET ルートが存在しません。" });
  }

  if (!(await ctx.fileExists(sharePagePath))) {
    findings.push({ severity: "FAIL", message: "`share/[token]/page.tsx` が存在しません。" });
  } else {
    const content = await ctx.readFile(sharePagePath);
    if (!content || !/data-hide-on-print/.test(content) || /PrimaryButton\s+onClick=.*handleShare/.test(content || "")) {
      findings.push({
        severity: "WARN",
        message: "共有プレビューで編集系操作を抑止する UI が確認できません。",
        hints: [await ctx.toLineReference(sharePagePath, "PrintButton")],
      });
    }
  }

  return { id: "P10", title: "共有リンク", status: determineStatus(findings), findings };
}

/**
 * @param {DiagnoseContext} ctx
 * @returns {Promise<PhaseResult>}
 */
async function checkP11(ctx) {
  const findings = [];

  const registryPath = "src/templates/registry.tsx";
  if (!(await ctx.fileExists(registryPath))) {
    findings.push({ severity: "FAIL", message: "テンプレートレジストリ `src/templates/registry.tsx` が存在しません。" });
  }

  const typesPath = "src/templates/types.ts";
  if (!(await ctx.fileExists(typesPath))) {
    findings.push({ severity: "FAIL", message: "テンプレート型定義 `src/templates/types.ts` が存在しません。" });
  } else {
    const content = await ctx.readFile(typesPath);
    if (!content || !/TemplateId\s*=\s*"standard"\s*\|\s*"jis"\s*\|\s*"company-simple"/.test(content)) {
      findings.push({
        severity: "FAIL",
        message: "`TemplateId` に `\"standard\" | \"jis\" | \"company-simple\"` が揃っていません。",
        hints: [await ctx.toLineReference(typesPath, "TemplateId")],
      });
    }
  }

  const previewPath = "src/app/preview/page.tsx";
  if (!(await ctx.fileExists(previewPath))) {
    findings.push({ severity: "FAIL", message: "プレビュー画面 `src/app/preview/page.tsx` が存在しません。" });
  } else {
    const content = await ctx.readFile(previewPath);
    if (!content || !/getResumeTemplate\(/.test(content)) {
      findings.push({
        severity: "WARN",
        message: "プレビュー画面で `getResumeTemplate` が呼ばれていません。",
        hints: [await ctx.toLineReference(previewPath, "getResumeTemplate")],
      });
    }
    if (!content || !/toResumeData/.test(content)) {
      findings.push({
        severity: "FAIL",
        message: "テンプレート変換 `toResumeData()` が未実装または未使用です。",
        hints: ["`src/templates/toResumeData.ts` などにストアから `ResumeData` を構築する処理を実装してください。"],
      });
    }
  }

  return { id: "P11", title: "テンプレ切替", status: determineStatus(findings), findings };
}

/**
 * @param {DiagnoseContext} ctx
 * @returns {Promise<PhaseResult>}
 */
async function checkP12(ctx) {
  const findings = [];

  const i18nPath = "src/i18n/i18n.tsx";
  if (!(await ctx.fileExists(i18nPath))) {
    findings.push({
      severity: "FAIL",
      message: "`src/i18n/i18n.tsx` が存在しません (I18nProvider 未実装)。",
    });
  }

  const jaPath = "src/i18n/ja.json";
  if (!(await ctx.fileExists(jaPath))) {
    findings.push({ severity: "FAIL", message: "日本語リソース `src/i18n/ja.json` が存在しません。" });
  }

  const enPath = "src/i18n/en.json";
  if (!(await ctx.fileExists(enPath))) {
    findings.push({ severity: "FAIL", message: "英語リソース `src/i18n/en.json` が存在しません。" });
  }

  const layoutPath = "src/app/layout.tsx";
  const layoutContent = await ctx.readFile(layoutPath);
  if (!layoutContent || !/I18nProvider/.test(layoutContent)) {
    findings.push({
      severity: "FAIL",
      message: "`layout.tsx` で `I18nProvider` によるラップが確認できません。",
      hints: [await ctx.toLineReference(layoutPath, "<html")],
    });
  }

  const tUsageCount = await countTranslationHooks(ctx);
  if (tUsageCount < 5) {
    findings.push({
      severity: "WARN",
      message: "`t(\"...\")` を利用したラベル表記が十分に検出できません。",
      hints: ["プロフィール・プレビュー画面で翻訳関数を用いた文言化を検討してください。"],
    });
  }

  return { id: "P12", title: "i18n/表記", status: determineStatus(findings), findings };
}

/**
 * @param {DiagnoseContext} ctx
 */
async function countTranslationHooks(ctx) {
  let total = 0;
  for (const file of ctx.sourceFiles) {
    if (!file.endsWith(".tsx") && !file.endsWith(".ts")) {
      continue;
    }
    const content = await ctx.readFile(file);
    if (!content) continue;
    const matches = content.match(/\bt\(\s*['"]/g);
    total += matches ? matches.length : 0;
  }
  return total;
}

/**
 * @param {DiagnoseContext} ctx
 * @returns {Promise<PhaseResult>}
 */
async function checkP13(ctx) {
  const findings = [];

  const uploaderPath = "src/components/PhotoUploader.tsx";
  if (!(await ctx.fileExists(uploaderPath))) {
    findings.push({ severity: "FAIL", message: "写真アップローダー `PhotoUploader` が存在しません。" });
  }

  const cropPath = "src/lib/image/cropAndCompress.ts";
  if (!(await ctx.fileExists(cropPath))) {
    findings.push({ severity: "FAIL", message: "画像クロップ処理 `cropAndCompress.ts` が存在しません。" });
  }

  const profilePagePath = "src/app/resume/profile/page.tsx";
  const profilePage = await ctx.readFile(profilePagePath);
  if (!profilePage || !/PhotoUploader/.test(profilePage)) {
    findings.push({
      severity: "WARN",
      message: "プロフィール画面から `PhotoUploader` が利用されていません。",
      hints: [await ctx.toLineReference(profilePagePath, "PhotoUploader")],
    });
  }

  return { id: "P13", title: "画像処理", status: determineStatus(findings), findings };
}

/**
 * @param {DiagnoseContext} ctx
 * @returns {Promise<PhaseResult>}
 */
async function checkP19(ctx) {
  const findings = [];

  const a11yCssPath = "src/styles/a11y.css";
  if (!(await ctx.fileExists(a11yCssPath))) {
    findings.push({ severity: "FAIL", message: "アクセシビリティスタイル `src/styles/a11y.css` が存在しません。" });
  }

  const layoutPath = "src/app/layout.tsx";
  const layoutContent = await ctx.readFile(layoutPath);
  if (!layoutContent || !/role=\"main\"/.test(layoutContent) || !/role=\"banner\"/.test(layoutContent)) {
    findings.push({
      severity: "WARN",
      message: "`layout.tsx` にランドマークロール (navigation/main/banner) が不足しています。",
      hints: [await ctx.toLineReference(layoutPath, "role=")],
    });
  }

  const profilePagePath = "src/app/resume/profile/page.tsx";
  const profileContent = await ctx.readFile(profilePagePath);
  if (!profileContent || !/aria-invalid/.test(profileContent)) {
    findings.push({
      severity: "WARN",
      message: "プロフィール画面に `aria-invalid` 属性が不足しています。",
      hints: [await ctx.toLineReference(profilePagePath, "aria-invalid")],
    });
  }
  if (!profileContent || !/role=\"alert\"/.test(profileContent)) {
    findings.push({
      severity: "WARN",
      message: "プロフィール画面にエラーメッセージ用 `role=\"alert\"` が不足しています。",
      hints: [await ctx.toLineReference(profilePagePath, "role=\"alert\"")],
    });
  }

  return { id: "P19", title: "アクセシビリティ", status: determineStatus(findings), findings };
}

/**
 * @param {DiagnoseContext} ctx
 * @returns {Promise<PhaseResult>}
 */
async function checkP20(ctx) {
  const findings = [];

  const e2eDirPath = "tests/e2e";
  if (!(await ctx.fileExists(e2eDirPath))) {
    findings.push({ severity: "FAIL", message: "`tests/e2e` ディレクトリが存在しません。" });
  }

  const playwrightConfigPath = "playwright.config.ts";
  if (!(await ctx.fileExists(playwrightConfigPath))) {
    findings.push({ severity: "FAIL", message: "`playwright.config.ts` が存在しません。" });
  }

  return { id: "P20", title: "E2E", status: determineStatus(findings), findings };
}

/**
 * @param {DiagnoseContext} ctx
 * @returns {Promise<PhaseResult>}
 */
async function checkP21(ctx) {
  const findings = [];
  const requiredFiles = [
    "README.md",
    "docs/USER_GUIDE.md",
    "docs/ADMIN_GUIDE.md",
    "docs/DEVELOPER_GUIDE.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    ".env.example",
  ];

  for (const file of requiredFiles) {
    if (!(await ctx.fileExists(file))) {
      findings.push({ severity: "FAIL", message: `ドキュメント ${file} が見つかりません。` });
    }
  }

  return { id: "P21", title: "ドキュメント", status: determineStatus(findings), findings };
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("診断スクリプトが失敗しました", error);
  process.exit(1);
});
