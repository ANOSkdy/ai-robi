"use client";

import { useMemo } from "react";

import { getResumeTemplate } from "@/templates/registry";
import type { ResumeData, TemplateId } from "@/templates/types";

const textHasValue = (value?: string | null) => {
  if (!value) {
    return false;
  }
  return value.trim().length > 0;
};

const hasResumeDataContent = (data: ResumeData) => {
  if (textHasValue(data.profile.name) || textHasValue(data.profile.address) || textHasValue(data.profile.email)) {
    return true;
  }

  if (data.education.length > 0 || data.work.length > 0 || data.licenses.length > 0) {
    return true;
  }

  if (data.pr && (textHasValue(data.pr.generated) || (data.pr.answers?.length ?? 0) > 0)) {
    return true;
  }

  if (data.career && textHasValue(data.career.generatedCareer)) {
    return true;
  }

  return false;
};

type SharePreviewClientProps = {
  data: ResumeData;
  templateId: TemplateId;
};

export default function SharePreviewClient({ data, templateId }: SharePreviewClientProps) {
  const template = getResumeTemplate(templateId);
  const hasContent = useMemo(() => hasResumeDataContent(data), [data]);

  return (
    <div className="print-container mx-auto w-[794px] bg-white p-10 text-black shadow print:w-full print:bg-white print:p-0 print:text-black">
      {hasContent ? (
        template.component(data)
      ) : (
        <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-500">
          共有された内容が見つかりませんでした。
        </div>
      )}
    </div>
  );
}
