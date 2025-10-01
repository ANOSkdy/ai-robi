import { headers } from "next/headers";

import PrimaryButton from "@/components/ui/PrimaryButton";
import type { ShareData } from "@/app/api/share/route";
import { shareDataSchema } from "@/app/api/share/route";
import SharePreviewClient from "./SharePreviewClient";
import type { ResumeData, TemplateId } from "@/templates/types";

const textHasValue = (value?: string | null) => {
  if (!value) {
    return false;
  }
  return value.trim().length > 0;
};

const getBaseUrl = async () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  const headerList = await headers();
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");

  if (host) {
    return `${protocol}://${host}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
};

const fetchShareData = async (token: string): Promise<ShareData | null> => {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/share/${token}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  const parsed = shareDataSchema.safeParse(json);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
};

function PrintButton() {
  "use client";

  const handlePrint = () => {
    window.print();
  };

  return (
    <PrimaryButton onClick={handlePrint} aria-label="印刷プレビューを開く">
      印刷
    </PrimaryButton>
  );
}

const buildResumeDataFromShare = (data: ShareData): ResumeData => {
  const { resume, career } = data;
  const prText = resume.prText.trim();
  const profile = resume.profile;
  const careerText = (() => {
    const explicit = career.cvText.trim();
    if (explicit.length > 0) {
      return explicit;
    }

    const jobProfileParts = [
      career.cv.jobProfile.name ? `氏名: ${career.cv.jobProfile.name}` : null,
      career.cv.jobProfile.title ? `タイトル: ${career.cv.jobProfile.title}` : null,
      career.cv.jobProfile.summary ? `要約: ${career.cv.jobProfile.summary}` : null,
    ].filter((part): part is string => part !== null);

    const experienceParts = career.cv.experiences
      .map((experience) => {
        const achievements = experience.achievements
          .map((achievement) => achievement.trim())
          .filter((achievement) => achievement.length > 0);
        const achievementText = achievements.length > 0 ? `\n・${achievements.join("\n・")}` : "";
        const period = experience.period ? `${experience.period}` : "";
        const role = experience.role ? `／${experience.role}` : "";
        return `${period} ${experience.company}${role}${achievementText}`.trim();
      })
      .filter((entry) => entry.length > 0);

    const sections = [...jobProfileParts, ...experienceParts];
    if (sections.length === 0) {
      return undefined;
    }
    return sections.join("\n\n");
  })();

  return {
    profile: {
      name: profile.name,
      nameKana: profile.nameKana || undefined,
      birth: textHasValue(profile.birth) ? profile.birth : undefined,
      address: profile.address,
      phone: profile.phone,
      email: profile.email,
      avatarUrl: profile.avatarUrl || undefined,
    },
    education: resume.education.map((entry) => ({
      start: entry.start,
      end: entry.end || undefined,
      title: entry.school,
      detail: entry.degree || undefined,
      status: entry.status,
    })),
    work: resume.employment.map((entry) => ({
      start: entry.start,
      end: entry.end || undefined,
      title: entry.company,
      detail: entry.role,
      status: entry.status,
    })),
    licenses: resume.licenses.map((entry) => ({
      name: entry.name,
      acquiredOn: entry.obtainedOn || undefined,
    })),
    pr: prText.length > 0 ? { generated: prText } : undefined,
    career: careerText ? { generatedCareer: careerText } : undefined,
  };
};

export default async function SharePreviewPage({ params }: { params: { token: string } }) {
  const data = await fetchShareData(params.token);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-center">
        <div className="space-y-4 rounded-lg bg-white p-8 shadow">
          <h1 className="text-2xl font-semibold text-slate-900">リンクが無効か期限切れです</h1>
          <p className="text-sm text-slate-600">共有リンクの有効期限が切れたか、存在しないリンクです。再度発行を依頼してください。</p>
        </div>
      </div>
    );
  }

  const resumeData = buildResumeDataFromShare(data);
  const templateId: TemplateId = data.templateId ?? "standard";

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto w-full max-w-[820px] px-4 print:w-auto print:max-w-none print:px-0">
        <div className="mb-4 flex justify-end gap-3 print:hidden" data-hide-on-print>
          <PrintButton />
        </div>

        <SharePreviewClient data={resumeData} templateId={templateId} />
      </div>
    </div>
  );
}
