"use client";

import { TemplateSpec, TemplateId, ResumeData } from "./types";
import Standard from "./resume/Standard";
import JIS from "./resume/JIS";
import CompanySimple from "./resume/CompanySimple";

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  standard: "標準",
  jis: "JIS 様式",
  "company-simple": "シンプル（会社向け）",
};

export const resumeTemplates: TemplateSpec[] = [
  { id: "standard", label: TEMPLATE_LABELS.standard, kind: "both", component: (d: ResumeData) => <Standard data={d} /> },
  { id: "jis", label: TEMPLATE_LABELS.jis, kind: "resume", component: (d: ResumeData) => <JIS data={d} /> },
  {
    id: "company-simple",
    label: TEMPLATE_LABELS["company-simple"],
    kind: "both",
    component: (d: ResumeData) => <CompanySimple data={d} />,
  },
];

const isTemplateId = (value: unknown): value is TemplateId =>
  value === "standard" || value === "jis" || value === "company-simple";

export function getResumeTemplate(id: TemplateId | string | null | undefined): TemplateSpec {
  const fallbackId: TemplateId = isTemplateId(id) ? id : "standard";
  const found = resumeTemplates.find((template) => template.id === fallbackId);
  return found ?? resumeTemplates[0];
}
