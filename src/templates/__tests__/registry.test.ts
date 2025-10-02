import { describe, expect, it } from "vitest";

import { getResumeTemplate, resumeTemplates } from "../registry";

describe("getResumeTemplate", () => {
  it("returns a known template for valid ids", () => {
    const ids = resumeTemplates.map((template) => template.id);
    ids.forEach((id) => {
      const template = getResumeTemplate(id);
      expect(template.id).toBe(id);
    });
  });

  it("falls back to the standard template when the id is invalid", () => {
    const template = getResumeTemplate("non-existent");
    expect(template.id).toBe("standard");
  });
});
