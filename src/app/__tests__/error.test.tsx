import React from "react";
import { describe, expect, it, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import GlobalError from "@/app/error";

const globalRef = globalThis as typeof globalThis & {
  window?: { location: { href: string } };
  React?: typeof React;
};

afterEach(() => {
  delete globalRef.window;
  delete globalRef.React;
});

describe("GlobalError", () => {
  it("includes debug details when ?debug=1 is present", () => {
    globalRef.React = React;
    globalRef.window = { location: { href: "https://example.com/path?debug=1" } };
    const error = new Error("debug enabled");
    const markup = renderToStaticMarkup(
      <GlobalError error={error} reset={() => undefined} />,
    );

    expect(markup).toContain("debug enabled");
  });

  it("hides debug details when query param is missing", () => {
    globalRef.React = React;
    globalRef.window = { location: { href: "https://example.com/path" } };
    const error = new Error("should be hidden");
    const markup = renderToStaticMarkup(
      <GlobalError error={error} reset={() => undefined} />,
    );

    expect(markup).not.toContain("should be hidden");
  });
});
