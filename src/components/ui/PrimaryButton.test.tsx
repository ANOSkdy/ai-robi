import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PrimaryButton from "./PrimaryButton";

describe("PrimaryButton", () => {
  it("renders provided children", () => {
    const html = renderToStaticMarkup(<PrimaryButton>確認</PrimaryButton>);

    expect(html).toContain(">確認<");
  });

  it("sets disabled when loading", () => {
    const html = renderToStaticMarkup(<PrimaryButton loading>処理</PrimaryButton>);

    expect(html).toContain("disabled");
    expect(html).toContain("aria-busy=\"true\"");
    expect(html).toContain("処理中...");
  });
});
