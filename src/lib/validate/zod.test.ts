import { describe, expect, it } from "vitest";

import { zResumeForm, zResumeProfile } from "./zod";

describe("zResumeProfile", () => {
  it("rejects an invalid email address", () => {
    const result = zResumeProfile.safeParse({
      name: "山田 太郎",
      birthday: "1990-01-01",
      address: "東京都新宿区",
      phone: "080-0000-0000",
      email: "invalid-email",
      photoUrl: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("zResumeForm", () => {
  it("accepts a fully populated resume", () => {
    const result = zResumeForm.safeParse({
      profile: {
        name: "山田 太郎",
        birthday: "1990-01-01",
        address: "東京都新宿区",
        phone: "080-0000-0000",
        email: "taro@example.com",
        photoUrl: "https://example.com/photo.jpg",
      },
      education: [
        {
          start: "2008-04",
          end: "2012-03",
          title: "AI大学 工学部",
          detail: "情報工学科",
          status: "卒業",
        },
      ],
      work: [
        {
          start: "2012-04",
          end: "2020-03",
          title: "株式会社テック 研究開発部",
          detail: "ソフトウェアエンジニア",
          status: "退社",
        },
      ],
      licenses: [
        {
          name: "応用情報技術者",
          acquiredOn: "2015-06-01",
        },
      ],
      pr: {
        answers: ["A", "B", "C", "D", "E"],
        generated: "自己PR文",
      },
    });

    expect(result.success).toBe(true);
  });
});
