import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import FlatBarChart from "./FlatBarChart";

const globalWithReact = globalThis as typeof globalThis & { React?: typeof React };
globalWithReact.React = React;

describe("FlatBarChart", () => {
  it("renders a bar for each data point", () => {
    const html = renderToStaticMarkup(
      React.createElement(FlatBarChart, { data: [10, 20, 30], label: "テスト棒グラフ" })
    );
    const bars = html.match(/data-bar-index=/g) ?? [];

    expect(html).toContain("aria-label=\"テスト棒グラフ\"");
    expect(bars.length).toBe(3);
  });
});
