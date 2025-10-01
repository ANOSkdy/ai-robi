import { describe, expect, beforeEach, it } from "vitest";

import { useResumeStore } from "../../store/resume";
import { toResumeData } from "../toResumeData";

describe("toResumeData", () => {
  beforeEach(() => {
    useResumeStore.getState().resetAll();
  });

  it("converts store state into template data with trimming and fallbacks", () => {
    useResumeStore.getState().setProfile({
      name: " 山田 太郎 ",
      nameKana: " やまだ たろう ",
      birth: "1990-01-01",
      address: " 東京都 ",
      phone: " 090-1234-5678 ",
      email: " user@example.com ",
      avatarUrl: " https://example.com/avatar.png ",
    });

    useResumeStore.setState({
      education: [
        {
          school: " 東京大学 ",
          degree: " 学士 ",
          start: "2008-04",
          end: "2012-03",
          status: "卒業",
        },
      ],
      employment: [
        {
          company: " Example Corp ",
          role: " エンジニア ",
          start: "2012-04",
          end: "2020-03",
          status: "退社",
        },
      ],
      licenses: [
        {
          name: " 基本情報技術者 ",
          obtainedOn: "2010-04-01",
        },
      ],
      prText: " 自己PR本文 ",
      prAnswers: [" 回答1 ", "", "  ", "回答2", ""],
      cvText: "",
      cv: {
        jobProfile: {
          name: " 山田 太郎 ",
          title: " リーダー ",
          summary: " チームを率いた実績があります。 ",
        },
        experiences: [
          {
            company: " Example Corp ",
            role: " リードエンジニア ",
            period: "2012-04〜2020-03",
            achievements: [" 開発プロジェクトを成功に導いた ", "  "],
          },
        ],
      },
    });

    const result = toResumeData();

    expect(result.profile).toEqual({
      name: "山田 太郎",
      nameKana: "やまだ たろう",
      birth: "1990-01-01",
      address: "東京都",
      phone: "090-1234-5678",
      email: "user@example.com",
      avatarUrl: "https://example.com/avatar.png",
    });

    expect(result.education).toEqual([
      {
        start: "2008-04",
        end: "2012-03",
        title: "東京大学",
        detail: "学士",
        status: "卒業",
      },
    ]);

    expect(result.work).toEqual([
      {
        start: "2012-04",
        end: "2020-03",
        title: "Example Corp",
        detail: "エンジニア",
        status: "退社",
      },
    ]);

    expect(result.licenses).toEqual([
      {
        name: "基本情報技術者",
        acquiredOn: "2010-04-01",
      },
    ]);

    expect(result.pr).toEqual({
      generated: "自己PR本文",
      answers: ["回答1", "回答2"],
    });

    const expectedCareerLines = [
      "氏名: 山田 太郎",
      "タイトル: リーダー",
      "要約: チームを率いた実績があります。",
      "2012-04〜2020-03 Example Corp／リードエンジニア\n・開発プロジェクトを成功に導いた",
    ];

    expect(result.career).toEqual({
      generatedCareer: expectedCareerLines.join("\n\n"),
    });
  });
});
