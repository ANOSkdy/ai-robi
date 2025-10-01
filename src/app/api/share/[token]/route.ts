import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { shareDataSchema } from "../route";

export const runtime = "nodejs";

const kvPayloadSchema = z.object({
  data: shareDataSchema,
  exp: z.number(),
});

const getKvConfig = () => {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error("KV configuration is missing");
  }

  return { url, token };
};

const fetchShareData = async (token: string) => {
  const { url, token: authToken } = getKvConfig();

  const response = await fetch(`${url}/get/${token}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load share data");
  }

  const json = await response.json();
  if (typeof json.result !== "string") {
    return null;
  }

  try {
    const parsed = kvPayloadSchema.safeParse(JSON.parse(json.result));

    if (!parsed.success) {
      return null;
    }

    return parsed.data;
  } catch (error) {
    return null;
  }
};

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  let token: string | undefined;
  try {
    ({ token } = await context.params);
  } catch (error) {
    return NextResponse.json({ message: "Token missing" }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ message: "Token missing" }, { status: 400 });
  }

  if (process.env.E2E_MOCK === "1" && token === "mocktoken") {
    return NextResponse.json(
      {
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
      },
      { status: 200 },
    );
  }

  try {
    const kvData = await fetchShareData(token);

    if (!kvData) {
      return NextResponse.json(
        { message: "Link expired or not found" },
        { status: 404 },
      );
    }

    if (kvData.exp * 1000 <= Date.now()) {
      return NextResponse.json(
        { message: "Link expired or not found" },
        { status: 404 },
      );
    }

    const data = kvData.data;

    return NextResponse.json(
      {
        ...data,
        templateId: data.templateId ?? "standard",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
