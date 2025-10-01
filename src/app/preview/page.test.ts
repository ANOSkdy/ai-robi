import { describe, expect, it } from "vitest";

import type { ResumeData } from "@/templates/types";
import { hasResumeDataContent } from "./page";

const createResumeData = (overrides: Partial<ResumeData>): ResumeData => ({
  profile: {
    name: "",
    address: "",
    phone: "",
    email: "",
    ...overrides.profile,
  },
  education: overrides.education ?? [],
  work: overrides.work ?? [],
  licenses: overrides.licenses ?? [],
  pr: overrides.pr,
  career: overrides.career,
});

describe("hasResumeDataContent", () => {
  it("returns false when no sections contain content", () => {
    const data = createResumeData({});
    expect(hasResumeDataContent(data)).toBe(false);
  });

  it("returns true when profile contains visible text", () => {
    const data = createResumeData({ profile: { name: "山田太郎" } });
    expect(hasResumeDataContent(data)).toBe(true);
  });

  it("returns true when generated career exists", () => {
    const data = createResumeData({ career: { generatedCareer: "経歴のサマリー" } });
    expect(hasResumeDataContent(data)).toBe(true);
  });
});
