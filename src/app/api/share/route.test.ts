import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_TTL_SECONDS, POST } from "./route";

vi.mock("uuid", () => ({
  v4: () => "mock-share-token",
}));

const originalEnv = { ...process.env };
const originalFetch = global.fetch;
let fetchMock: ReturnType<typeof vi.fn>;

describe("POST /api/share", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv } as NodeJS.ProcessEnv;
    fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn(() => Promise.resolve({ result: "OK" })) });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    process.env = { ...originalEnv } as NodeJS.ProcessEnv;
    global.fetch = originalFetch;
  });

  it("stores share data with TTL and returns the public URL", async () => {
    process.env.KV_REST_API_URL = "https://kv.example.com";
    process.env.KV_REST_API_TOKEN = "test-token";
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";

    const payload = {
      resume: {
        profile: {
          name: "山田太郎",
          nameKana: "やまだたろう",
          birth: "1990-01-01",
          address: "東京都",
          phone: "000-0000-0000",
          email: "taro@example.com",
          avatarUrl: "https://example.com/avatar.png",
        },
        education: [
          {
            school: "テスト大学",
            degree: "工学部",
            start: "2008-04",
            end: "2012-03",
            status: "卒業",
          },
        ],
        employment: [
          {
            company: "テスト株式会社",
            role: "エンジニア",
            start: "2012-04",
            end: "2018-03",
            status: "退社",
          },
        ],
        licenses: [
          {
            name: "基本情報技術者",
            obtainedOn: "2011-10",
          },
        ],
        prText: "自己PR本文",
      },
      career: {
        cv: {
          jobProfile: {
            name: "山田太郎",
            title: "フルスタックエンジニア",
            summary: "要約テキスト",
          },
          experiences: [
            {
              company: "テスト株式会社",
              role: "エンジニア",
              period: "2012-2018",
              achievements: ["開発リード"],
            },
          ],
        },
        cvText: "職務経歴書本文",
      },
    };

    const request = new Request("https://app.example.com/api/share", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const json = (await response.json()) as { url?: string };
    expect(json.url).toBe("https://app.example.com/share/mock-share-token");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://kv.example.com/set/mock-share-token");
    expect(requestInit?.method).toBe("POST");

    const body = requestInit?.body as string;
    const parsed = JSON.parse(body);
    expect(parsed.ex).toBe(DEFAULT_TTL_SECONDS);

    const storedPayload = JSON.parse(parsed.value);
    expect(storedPayload.data.resume.profile.name).toBe("山田太郎");
    expect(typeof storedPayload.exp).toBe("number");
  });
});
