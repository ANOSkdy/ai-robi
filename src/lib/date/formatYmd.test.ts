import { describe, expect, it } from "vitest";

import { formatYmd } from "./formatYmd";

describe("formatYmd", () => {
  it("formats date as YYYYMMDD", () => {
    const date = new Date("2023-07-05T12:34:56Z");
    expect(formatYmd(date)).toBe("20230705");
  });
});
