import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import FlatDonutChart from "./FlatDonutChart";

const globalWithReact = globalThis as typeof globalThis & { React?: typeof React };
globalWithReact.React = React;

describe("FlatDonutChart", () => {
  it("clamps value and renders stroke offset", () => {
    const html = renderToStaticMarkup(
      React.createElement(FlatDonutChart, { value: 120, label: "テスト進捗" })
    );
    const offsetMatch = html.match(/stroke-dashoffset=\"([0-9.]+)\"/);

    expect(html).toContain("aria-label=\"テスト進捗 100%\"");
    expect(offsetMatch).not.toBeNull();

    if (offsetMatch) {
      expect(Number(offsetMatch[1])).toBeCloseTo(0, 5);
    }
  });
});
