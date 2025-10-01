import { Page } from "@playwright/test";

export async function mockAIAndShare(page: Page) {
  await page.route("**/api/ai/generate-resume", async (route) => {
    const json = {
      result: "これはE2Eのモック自己PRテキストです（具体例・数値を含む）。",
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(json),
    });
  });

  await page.route("**/api/ai/generate-career", async (route) => {
    const json = {
      result: "これはE2Eのモック職務経歴テキストです（役割・KPIを含む）。",
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(json),
    });
  });

  await page.route("**/api/share", async (route) => {
    const json = {
      url: `${process.env.BASE_URL || "http://localhost:3000"}/share/mocktoken`,
    };
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(json),
    });
  });

  await page.route("**/api/share/*", async (route) => {
    const json = {
      resume: {
        profile: {
          name: "山田太郎",
          nameKana: "ヤマダタロウ",
          birth: "1990-01-01",
          address: "東京都",
          phone: "090-0000-0000",
          email: "taro@example.com",
          avatarUrl: "",
        },
        education: [
          {
            school: "AI大学 情報工学部",
            degree: "卒業",
            start: "2008-04",
            end: "2012-03",
            status: "卒業",
          },
        ],
        employment: [
          {
            company: "株式会社サンプル",
            role: "開発エンジニア",
            start: "2012-04",
            end: "2020-03",
            status: "退社",
          },
        ],
        licenses: [
          {
            name: "基本情報技術者",
            obtainedOn: "2011-11-01",
          },
        ],
        prText: "モック共有の自己PRです。",
      },
      career: {
        cv: {
          jobProfile: {
            name: "山田太郎",
            title: "リードエンジニア",
            summary: "AIプロダクト開発に従事",
          },
          experiences: [
            {
              company: "株式会社サンプル",
              role: "プロジェクトマネージャー",
              period: "2018-04〜2020-03",
              achievements: [
                "AIレジュメ自動化システムを導入し、作業時間を50%削減",
              ],
            },
          ],
        },
        cvText: "主要プロジェクトでAI活用を推進。",
      },
      templateId: "standard",
    } as const;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(json),
    });
  });
}
