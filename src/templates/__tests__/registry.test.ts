import { describe, expect, it } from "vitest";

import { getResumeTemplate, resumeTemplates } from "../registry";
import type { ResumeData } from "../types";

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

  it("produces renderable elements for each registered template", () => {
    const emptyData: ResumeData = {
      profile: { name: "", address: "", phone: "", email: "" },
      education: [],
      work: [],
      licenses: [],
    };

    resumeTemplates.forEach((template) => {
      const element = template.component(emptyData);
      expect(element).toBeTruthy();
      expect(element.props.data).toEqual(emptyData);
    });
  });
});
