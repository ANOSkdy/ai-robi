"use client";

import dynamic from "next/dynamic";
import { createElement } from "react";
import type { ComponentType } from "react";

import { TemplateSpec, TemplateId, ResumeData, TemplateRenderer } from "./types";

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  standard: "標準",
  jis: "JIS 様式",
  "company-simple": "シンプル（会社向け）",
};

type TemplateComponentProps = { data: ResumeData };

const Loading = () => (
  <div className="section" aria-busy="true">
    プレビューを読み込み中…
  </div>
);

Loading.displayName = "TemplatePreviewLoading";

const DynStandard: ComponentType<TemplateComponentProps> = dynamic<TemplateComponentProps>(
  () => import("./resume/Standard"),
  { ssr: false, loading: Loading },
);

const DynJis: ComponentType<TemplateComponentProps> = dynamic<TemplateComponentProps>(
  () => import("./resume/JIS"),
  { ssr: false, loading: Loading },
);

const DynCompanySimple: ComponentType<TemplateComponentProps> = dynamic<TemplateComponentProps>(
  () => import("./resume/CompanySimple"),
  { ssr: false, loading: Loading },
);

const toRenderer = (Component: ComponentType<TemplateComponentProps>): TemplateRenderer => {
  function RenderWithData(data: ResumeData) {
    return createElement(Component, { data });
  }

  return RenderWithData;
};

const templateComponents: Record<TemplateId, ComponentType<TemplateComponentProps>> = {
  standard: DynStandard,
  jis: DynJis,
  "company-simple": DynCompanySimple,
};

export const resumeTemplates: TemplateSpec[] = [
  {
    id: "standard",
    label: TEMPLATE_LABELS.standard,
    kind: "both",
    component: toRenderer(templateComponents.standard),
  },
  { id: "jis", label: TEMPLATE_LABELS.jis, kind: "resume", component: toRenderer(templateComponents.jis) },
  {
    id: "company-simple",
    label: TEMPLATE_LABELS["company-simple"],
    kind: "both",
    component: toRenderer(templateComponents["company-simple"]),
  },
];

const isTemplateId = (value: unknown): value is TemplateId =>
  value === "standard" || value === "jis" || value === "company-simple";

export function getResumeTemplate(id: unknown): TemplateSpec {
  const fallbackId: TemplateId = isTemplateId(id) ? id : "standard";
  const found = resumeTemplates.find((template) => template.id === fallbackId);
  return found ?? {
    id: "standard",
    label: TEMPLATE_LABELS.standard,
    kind: "both",
    component: toRenderer(templateComponents.standard),
  };
}
