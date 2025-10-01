"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { FormSection } from "@/components/ui/FormSection";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useResumeStore } from "@/store/resume";
import AIGeneratePanel from "@/components/AIGeneratePanel";

const jobProfileSchema = z.object({
  name: z.string().trim().optional().or(z.literal("")),
  title: z.string().trim().min(1, "職務タイトルを入力してください。"),
  summary: z.string().trim().optional().or(z.literal("")),
});

type JobProfileForm = z.infer<typeof jobProfileSchema>;

const experienceSchema = z.object({
  company: z.string().trim().min(1, "会社名を入力してください。"),
  role: z.string().trim().min(1, "役割を入力してください。"),
  period: z.string().trim().min(1, "期間を入力してください。"),
  achievementsText: z.string().trim().optional().or(z.literal("")),
});

type ExperienceForm = z.infer<typeof experienceSchema>;

const formSchema = z.object({
  jobProfile: jobProfileSchema,
  experiences: z.array(experienceSchema).min(1, "経験を1件以上入力してください。"),
});

const createExperienceRow = (): ExperienceForm => ({
  company: "",
  role: "",
  period: "",
  achievementsText: "",
});

export default function CvPage() {
  const { cv, profileName, setCvState, cvText, setCvText } = useResumeStore((state) => ({
    cv: state.cv,
    profileName: state.profile.name,
    setCvState: state.setCvState,
    cvText: state.cvText,
    setCvText: state.setCvText,
  }));

  const [jobProfile, setJobProfile] = useState<JobProfileForm>(() => ({
    name: cv.jobProfile.name ?? "",
    title: cv.jobProfile.title ?? "",
    summary: cv.jobProfile.summary ?? "",
  }));
  const [experiences, setExperiences] = useState<ExperienceForm[]>(() =>
    cv.experiences.length > 0
      ? cv.experiences.map((exp) => ({
          company: exp.company,
          role: exp.role,
          period: exp.period,
          achievementsText: exp.achievements.join("\n"),
        }))
      : [createExperienceRow()],
  );
  const [experienceErrors, setExperienceErrors] = useState<Array<Partial<Record<keyof ExperienceForm, string>>>>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [saved, setSaved] = useState(false);

  const jobNamePlaceholder = useMemo(() => profileName || "", [profileName]);

  const handleJobProfileChange = <K extends keyof JobProfileForm>(key: K, value: JobProfileForm[K]) => {
    setJobProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleExperienceChange = <K extends keyof ExperienceForm>(index: number, key: K, value: ExperienceForm[K]) => {
    setExperiences((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const resetErrors = () => {
    setExperienceErrors([]);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    resetErrors();

    const result = formSchema.safeParse({ jobProfile, experiences });
    if (!result.success) {
      const nextErrors: Array<Partial<Record<keyof ExperienceForm, string>>> = [];
      result.error.issues.forEach((issue) => {
        const [section, index, field] = issue.path as ["jobProfile" | "experiences", number, string];
        if (section === "jobProfile") {
          setErrorMessage(issue.message);
        }
        if (section === "experiences") {
          nextErrors[index] = {
            ...(nextErrors[index] ?? {}),
            [field as keyof ExperienceForm]: issue.message,
          };
        }
      });
      setExperienceErrors(nextErrors);
      if (!result.error.issues.some((issue) => issue.path[0] === "jobProfile")) {
        setErrorMessage("入力内容をご確認ください。必要な項目が不足しています。");
      }
      return;
    }

    const normalizedExperiences = result.data.experiences.map((exp) => ({
      company: exp.company,
      role: exp.role,
      period: exp.period,
      achievements: exp.achievementsText
        ? exp.achievementsText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
        : [],
    }));

    setCvState({
      jobProfile: {
        name: result.data.jobProfile.name?.trim() || undefined,
        title: result.data.jobProfile.title,
        summary: result.data.jobProfile.summary?.trim() || undefined,
      },
      experiences: normalizedExperiences,
    });

    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const handleAddExperience = () => {
    setExperiences((prev) => [...prev, createExperienceRow()]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences((prev) => {
      const next = prev.filter((_, rowIndex) => rowIndex !== index);
      return next.length > 0 ? next : [createExperienceRow()];
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSave} noValidate>
      <FormSection title="職務経歴書：プロフィール" description="職務経歴書に掲載する基本情報を入力してください。">
        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="job-title" className="text-sm font-medium text-slate-800">
              職務タイトル <span className="text-red-500">*</span>
            </label>
            <input
              id="job-title"
              value={jobProfile.title}
              onChange={(event) => handleJobProfileChange("title", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="job-name" className="text-sm font-medium text-slate-800">
              表示名（任意）
            </label>
            <input
              id="job-name"
              placeholder={jobNamePlaceholder ? `${jobNamePlaceholder}（プロフィールから）` : "例：山田 太郎"}
              value={jobProfile.name}
              onChange={(event) => handleJobProfileChange("name", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="job-summary" className="text-sm font-medium text-slate-800">
              要約（任意）
            </label>
            <textarea
              id="job-summary"
              value={jobProfile.summary}
              onChange={(event) => handleJobProfileChange("summary", event.target.value)}
              className="min-h-[120px] rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>
      </FormSection>
      <FormSection title="職務経歴書：経験" description="経験を追加して詳細を整理してください。">
        <div className="space-y-6">
          {experiences.map((experience, index) => {
            const errors = experienceErrors[index] ?? {};
            return (
              <div key={`experience-${index}`} className="rounded-lg border border-slate-200 p-4 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`experience-company-${index}`} className="text-sm font-medium text-slate-800">
                      会社名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`experience-company-${index}`}
                      value={experience.company}
                      onChange={(event) => handleExperienceChange(index, "company", event.target.value)}
                      className={`rounded-md border px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                        errors.company ? "border-red-400" : "border-slate-200"
                      }`}
                      aria-invalid={errors.company ? "true" : undefined}
                    />
                    {errors.company ? <p className="text-xs text-red-600">{errors.company}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`experience-role-${index}`} className="text-sm font-medium text-slate-800">
                      役割 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`experience-role-${index}`}
                      value={experience.role}
                      onChange={(event) => handleExperienceChange(index, "role", event.target.value)}
                      className={`rounded-md border px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                        errors.role ? "border-red-400" : "border-slate-200"
                      }`}
                      aria-invalid={errors.role ? "true" : undefined}
                    />
                    {errors.role ? <p className="text-xs text-red-600">{errors.role}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label htmlFor={`experience-period-${index}`} className="text-sm font-medium text-slate-800">
                      期間 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`experience-period-${index}`}
                      value={experience.period}
                      onChange={(event) => handleExperienceChange(index, "period", event.target.value)}
                      className={`rounded-md border px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                        errors.period ? "border-red-400" : "border-slate-200"
                      }`}
                      aria-invalid={errors.period ? "true" : undefined}
                    />
                    {errors.period ? <p className="text-xs text-red-600">{errors.period}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label htmlFor={`experience-achievements-${index}`} className="text-sm font-medium text-slate-800">
                      実績（複数行で入力）
                    </label>
                    <textarea
                      id={`experience-achievements-${index}`}
                      value={experience.achievementsText}
                      onChange={(event) => handleExperienceChange(index, "achievementsText", event.target.value)}
                      className="min-h-[120px] rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      placeholder="1行につき1項目を入力"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(index)}
                    className="text-sm text-slate-600 underline transition hover:text-slate-900"
                  >
                    行を削除
                  </button>
                </div>
              </div>
            );
          })}
          <button
            type="button"
            onClick={handleAddExperience}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            行を追加
          </button>
        </div>
      </FormSection>
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            保存する
          </button>
        </div>
      </div>
      <AIGeneratePanel
        endpoint="/api/ai/generate-career"
        payload={{
          profileBrief: [jobProfile.name?.trim() || profileName || "", jobProfile.title?.trim() || "", jobProfile.summary?.trim() || ""]
            .filter(Boolean)
            .map((value, index) => {
              if (index === 0) return `氏名: ${value}`;
              if (index === 1) return `タイトル: ${value}`;
              return value;
            })
            .join("\n"),
          companies: experiences.map((experience) => ({
            company: experience.company.trim(),
            period: experience.period.trim(),
            role: experience.role.trim(),
            achievements: experience.achievementsText
              ? experience.achievementsText
                  .split(/\r?\n/)
                  .map((line) => line.trim())
                  .filter(Boolean)
              : [],
          })),
        }}
        onApply={(text) => setCvText(text)}
        buttonLabel="AIで職務経歴書生成"
      />
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label htmlFor="cv-generated-text" className="text-sm font-semibold text-slate-900">
          職務経歴書本文
        </label>
        <textarea
          id="cv-generated-text"
          className="min-h-[240px] w-full rounded border border-slate-300 p-3 text-sm"
          value={cvText}
          onChange={(event) => setCvText(event.target.value)}
          aria-label="AI生成した職務経歴書本文"
        />
      </div>
      {saved ? (
        <div className="fixed bottom-6 right-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          保存しました
        </div>
      ) : null}
    </form>
  );
}
