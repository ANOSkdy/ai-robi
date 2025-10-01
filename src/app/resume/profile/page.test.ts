import { describe, expect, it } from "vitest";

import { profileSchema } from "./schema";

describe("profileSchema avatarUrl", () => {
  const base = {
    name: "山田 太郎",
    nameKana: "ヤマダ タロウ",
    birth: "1990-01-01",
    address: "東京都千代田区1-1",
    phone: "0312345678",
    email: "taro@example.com",
  };

  it("accepts data URLs", () => {
    const result = profileSchema.safeParse({
      ...base,
      avatarUrl: "data:image/jpeg;base64,AAAA",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unsupported strings", () => {
    const result = profileSchema.safeParse({
      ...base,
      avatarUrl: "invalid-value",
    });
    expect(result.success).toBe(false);
  });
});
