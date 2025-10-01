import { afterEach, describe, expect, it } from "vitest";

import { useTemplateStore } from "./template";

afterEach(() => {
  useTemplateStore.getState().setTemplate("standard");
});

describe("template store", () => {
  it("defaults to standard template", () => {
    expect(useTemplateStore.getState().template).toBe("standard");
  });

  it("updates the selected template", () => {
    useTemplateStore.getState().setTemplate("jis");
    expect(useTemplateStore.getState().template).toBe("jis");
  });
});
