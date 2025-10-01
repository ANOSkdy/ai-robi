import type { ReactElement } from "react";

export type TemplateId = "standard" | "jis" | "company-simple";

export type ResumeData = {
  profile: {
    name: string;
    nameKana?: string;
    birth?: string; // YYYY-MM-DD
    address: string;
    phone: string;
    email: string;
    avatarUrl?: string;
  };
  education: Array<{ start: string; end?: string; title: string; detail?: string; status?: string }>;
  work: Array<{ start: string; end?: string; title: string; detail?: string; status?: string }>;
  licenses: Array<{ name: string; acquiredOn?: string }>;
  pr?: { generated?: string; answers?: string[] };
  career?: { generatedCareer?: string };
};

export type TemplateRenderer = (data: ResumeData) => ReactElement;

export type TemplateSpec = {
  id: TemplateId;
  label: string;
  kind: "resume" | "career" | "both";
  component: TemplateRenderer;
  className?: string;
};
