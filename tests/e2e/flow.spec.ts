import { expect, test } from "@playwright/test";
import { mockAIAndShare } from "./utils/mock";

declare global {
  interface Window {
    __printed__?: boolean;
  }
}

test.describe("主要フロー: 入力→AI生成→プレビュー/印刷→共有", () => {
  test.beforeEach(async ({ page }) => {
    await mockAIAndShare(page);
  });

  test("トップが表示され、主要CTAが2件ある", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /AI-ROBI/ })).toBeVisible();
    const hero = page.locator("section.hero");
    await expect(hero).toBeVisible();
    const ctas = hero.getByRole("link");
    await expect(ctas).toHaveCount(2);
    await expect(ctas.filter({ hasText: /履歴書を作成|Create Resume/ })).toHaveCount(1);
    await expect(ctas.filter({ hasText: /職務経歴書を作成|Create Career Doc/ })).toHaveCount(1);
  });

  test("プロフィール入力→自己PR AI生成→プレビューで反映", async ({ page }) => {
    await page.goto("/resume/profile");

    await page.getByLabel(/氏名|Full Name/i).fill("山田太郎");
    await page.getByLabel(/生年月日|Date of Birth/i).fill("1990-01-01");
    await page.getByLabel(/住所|Address/i).fill("東京都");
    await page.getByLabel(/電話|Phone/i).fill("090-0000-0000");
    await page.getByLabel(/メール|Email/i).fill("taro@example.com");
    await page.getByRole("button", { name: /保存/ }).click();

    await page.goto("/resume/pr");
    const generateButton = page.getByRole("button", { name: /AI.*自己PR|AI.*PR|AI生成/ });
    await generateButton.click();
    const generatedTextarea = page.getByLabel("生成結果の編集内容");
    await expect(generatedTextarea).toContainText(/モック自己PR/);

    await page.getByRole("button", { name: /この内容を反映/ }).click();
    await page.goto("/preview");

    await expect(page.getByRole("button", { name: /印刷|Print/ })).toBeVisible();
    await expect(page.getByText(/モック自己PR/)).toBeVisible();
  });

  test("印刷ボタンはwindow.printを呼ぶ", async ({ page }) => {
    await page.addInitScript(() => {
      const scopedWindow = window as Window & { __printed__?: boolean };
      scopedWindow.__printed__ = false;
      const originalPrint = scopedWindow.print.bind(scopedWindow);
      scopedWindow.print = () => {
        scopedWindow.__printed__ = true;
        originalPrint();
      };
    });

    await page.goto("/preview");
    await page.getByRole("button", { name: /印刷|Print/ }).click();
    const printed = await page.evaluate(() => window.__printed__ === true);
    expect(printed).toBe(true);
  });

  test("共有リンクの発行→共有ページで閲覧できる", async ({ page }) => {
    await page.goto("/preview");
    await page.getByRole("button", { name: /共有/ }).click();

    await page.goto("/share/mocktoken");
    await expect(page.getByText(/山田太郎/)).toBeVisible();
    await expect(page.getByText(/モック共有の自己PR/)).toBeVisible();
  });
});
