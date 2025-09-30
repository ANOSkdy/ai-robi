import { describe, expect, it } from "vitest";
import { sanitizePlainText } from "./client";

describe("sanitizePlainText", () => {
  it("removes repeated markdown symbols and normalizes whitespace", () => {
    const input = "## タイトル\n\n\r\n**重要**な実績を記載します。\n\n\n- 箇条書き";
    const sanitized = sanitizePlainText(input);
    expect(sanitized).toBe("タイトル\n\n重要な実績を記載します。\n\n- 箇条書き");
  });

  it("trims surrounding whitespace", () => {
    const input = "  実績を記載します。  ";
    expect(sanitizePlainText(input)).toBe("実績を記載します。");
  });
});
