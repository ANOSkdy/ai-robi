"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { FormSection } from "@/components/ui/FormSection";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import {
  useResumeStore,
  type EducationEntry,
  type EducationStatus,
  type EmploymentEntry,
  type EmploymentStatus,
  type LicenseEntry,
} from "@/store/resume";

const educationSchema = z.object({
  school: z.string().trim().min(1, "学校名を入力してください。"),
  degree: z.string().trim().optional().or(z.literal("")),
  start: z
    .string()
    .trim()
    .min(1, "開始年月を入力してください。")
    .refine((value) => !Number.isNaN(Date.parse(`${value}-01`)), {
      message: "YYYY-MM形式で入力してください。",
    }),
  end: z
    .string()
    .trim()
    .min(1, "終了年月を入力してください。")
    .refine((value) => !Number.isNaN(Date.parse(`${value}-01`)), {
      message: "YYYY-MM形式で入力してください。",
    }),
  status: z.enum(["入学", "卒業", "中退"] as const),
});

type EducationFormEntry = z.infer<typeof educationSchema>;

const employmentSchema = z.object({
  company: z.string().trim().min(1, "会社名を入力してください。"),
  role: z.string().trim().min(1, "職種/役割を入力してください。"),
  start: z
    .string()
    .trim()
    .min(1, "開始年月を入力してください。")
    .refine((value) => !Number.isNaN(Date.parse(`${value}-01`)), {
      message: "YYYY-MM形式で入力してください。",
    }),
  end: z
    .string()
    .trim()
    .min(1, "終了年月を入力してください。")
    .refine((value) => !Number.isNaN(Date.parse(`${value}-01`)), {
      message: "YYYY-MM形式で入力してください。",
    }),
  status: z.enum(["入社", "退社", "開業", "閉業"] as const),
});

type EmploymentFormEntry = z.infer<typeof employmentSchema>;

const licenseSchema = z.object({
  name: z.string().trim().min(1, "資格・免許名を入力してください。"),
  obtainedOn: z
    .string()
    .trim()
    .min(1, "取得日を入力してください。")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "YYYY-MM-DD形式で入力してください。",
    }),
});

type LicenseFormEntry = z.infer<typeof licenseSchema>;

const formSchema = z.object({
  education: z.array(educationSchema),
  employment: z.array(employmentSchema),
  licenses: z.array(licenseSchema),
});

const createEducationRow = (): EducationFormEntry => ({
  school: "",
  degree: "",
  start: "",
  end: "",
  status: "入学",
});

const createEmploymentRow = (): EmploymentFormEntry => ({
  company: "",
  role: "",
  start: "",
  end: "",
  status: "入社",
});

const createLicenseRow = (): LicenseFormEntry => ({
  name: "",
  obtainedOn: "",
});

export default function ResumeHistoryPage() {
  const { education, employment, licenses } = useResumeStore((state) => ({
    education: state.education,
    employment: state.employment,
    licenses: state.licenses,
  }));

  const [educationRows, setEducationRows] = useState<EducationFormEntry[]>(() =>
    education.length > 0
      ? education.map((item) => ({
          school: item.school,
          degree: item.degree ?? "",
          start: item.start,
          end: item.end,
          status: item.status,
        }))
      : [createEducationRow()],
  );
  const [employmentRows, setEmploymentRows] = useState<EmploymentFormEntry[]>(() =>
    employment.length > 0
      ? employment.map((item) => ({
          company: item.company,
          role: item.role,
          start: item.start,
          end: item.end,
          status: item.status,
        }))
      : [createEmploymentRow()],
  );
  const [licenseRows, setLicenseRows] = useState<LicenseFormEntry[]>(() =>
    licenses.length > 0
      ? licenses.map((item) => ({
          name: item.name,
          obtainedOn: item.obtainedOn,
        }))
      : [createLicenseRow()],
  );

  const [educationErrors, setEducationErrors] = useState<Array<Partial<Record<keyof EducationFormEntry, string>>>>([]);
  const [employmentErrors, setEmploymentErrors] = useState<Array<Partial<Record<keyof EmploymentFormEntry, string>>>>([]);
  const [licenseErrors, setLicenseErrors] = useState<Array<Partial<Record<keyof LicenseFormEntry, string>>>>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [saved, setSaved] = useState(false);

  const educationOptions = useMemo<EducationStatus[]>(() => ["入学", "卒業", "中退"], []);
  const employmentOptions = useMemo<EmploymentStatus[]>(() => ["入社", "退社", "開業", "閉業"], []);

  const handleEducationChange = <K extends keyof EducationFormEntry>(index: number, key: K, value: EducationFormEntry[K]) => {
    setEducationRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const handleEmploymentChange = <K extends keyof EmploymentFormEntry>(
    index: number,
    key: K,
    value: EmploymentFormEntry[K],
  ) => {
    setEmploymentRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const handleLicenseChange = <K extends keyof LicenseFormEntry>(index: number, key: K, value: LicenseFormEntry[K]) => {
    setLicenseRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const resetErrors = () => {
    setEducationErrors([]);
    setEmploymentErrors([]);
    setLicenseErrors([]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    resetErrors();

    const result = formSchema.safeParse({
      education: educationRows,
      employment: employmentRows,
      licenses: licenseRows,
    });

    if (!result.success) {
      const educationErrs: Array<Partial<Record<keyof EducationFormEntry, string>>> = [];
      const employmentErrs: Array<Partial<Record<keyof EmploymentFormEntry, string>>> = [];
      const licenseErrs: Array<Partial<Record<keyof LicenseFormEntry, string>>> = [];

      result.error.issues.forEach((issue) => {
        const [section, index, field] = issue.path as ["education" | "employment" | "licenses", number, string];
        if (section === "education") {
          educationErrs[index] = {
            ...(educationErrs[index] ?? {}),
            [field as keyof EducationFormEntry]: issue.message,
          };
        }
        if (section === "employment") {
          employmentErrs[index] = {
            ...(employmentErrs[index] ?? {}),
            [field as keyof EmploymentFormEntry]: issue.message,
          };
        }
        if (section === "licenses") {
          licenseErrs[index] = {
            ...(licenseErrs[index] ?? {}),
            [field as keyof LicenseFormEntry]: issue.message,
          };
        }
      });

      setEducationErrors(educationErrs);
      setEmploymentErrors(employmentErrs);
      setLicenseErrors(licenseErrs);
      setErrorMessage("入力内容をご確認ください。");
      return;
    }

    const normalizedEducation: EducationEntry[] = result.data.education.map((entry) => ({
      school: entry.school,
      degree: entry.degree?.trim() ? entry.degree.trim() : undefined,
      start: entry.start,
      end: entry.end,
      status: entry.status,
    }));

    const normalizedEmployment: EmploymentEntry[] = result.data.employment.map((entry) => ({
      company: entry.company,
      role: entry.role,
      start: entry.start,
      end: entry.end,
      status: entry.status,
    }));

    const normalizedLicenses: LicenseEntry[] = result.data.licenses.map((entry) => ({
      name: entry.name,
      obtainedOn: entry.obtainedOn,
    }));

    useResumeStore.setState({
      education: normalizedEducation,
      employment: normalizedEmployment,
      licenses: normalizedLicenses,
    });

    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <FormSection title="履歴書：学歴" description="学歴情報を入力してください。">
        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
        <div className="space-y-6">
          {educationRows.map((row, index) => {
            const errors = educationErrors[index] ?? {};
            return (
              <div key={`education-${index}`} className="rounded-lg border border-slate-200 p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`education-school-${index}`} className="text-sm font-medium text-slate-800">
                      学校名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`education-school-${index}`}
                      value={row.school}
                      onChange={(event) => handleEducationChange(index, "school", event.target.value)}
                      className={`rounded-md border px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                        errors.school ? "border-red-400" : "border-slate-200"
                      }`}
                      aria-invalid={errors.school ? "true" : undefined}
                    />
                    {errors.school ? <p className="text-xs text-red-600">{errors.school}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`education-degree-${index}`} className="text-sm font-medium text-slate-800">
                      学位・専攻（任意）
                    </label>
                    <input
                      id={`education-degree-${index}`}
                      value={row.degree ?? ""}
                      onChange={(event) => handleEducationChange(index, "degree", event.target.value)}
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`education-start-${index}`} className="text-sm font-medium text-slate-800">
                      入学年月 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`education-start-${index}`}
                      type="month"
                      value={row.start}
                      onChange={(event) => handleEducationChange(index, "start", event.target.value)}
                      className={`rounded-md border px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                        errors.start ? "border-red-400" : "border-slate-200"
                      }`}
                      aria-invalid={errors.start ? "true" : undefined}
                    />
                    {errors.start ? <p className="text-xs text-red-600">{errors.start}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`education-end-${index}`} className="text-sm font-medium text-slate-800">
                      終了年月 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`education-end-${index}`}
                      type="month"
                      value={row.end}
                      onChange={(event) => handleEducationChange(index, "end", event.target.value)}
                      className={`rounded-md border px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                        errors.end ? "border-red-400" : "border-slate-200"
                      }`}
                      aria-invalid={errors.end ? "true" : undefined}
                    />
                    {errors.end ? <p className="text-xs text-red-600">{errors.end}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`education-status-${index}`} className="text-sm font-medium text-slate-800">
                      状況 <span className="text-red-500">*</span>
                    </label>
                    <select
                      id={`education-status-${index}`}
                      value={row.status}
                      onChange={(event) => handleEducationChange(index, "status", event.target.value as EducationStatus)}
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      {educationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setEducationRows((prev) => {
                        const next = prev.filter((_, rowIndex) => rowIndex !== index);
                        return next.length > 0 ? next : [createEducationRow()];
                      })
                    }
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
            onClick={() => setEducationRows((prev) => [...prev, createEducationRow()])}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            行を追加
          </button>
        </div>
      </FormSection>
      <FormSection title="履歴書：職歴" description="職務経歴を入力してください。">
        <div className="space-y-6">
          {employmentRows.map((row, index) => {
            const errors = employmentErrors[index] ?? {};
            return (
              <div key={`employment-${index}`} className="rounded-lg border border-slate-200 p-4 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`employment-company-${index}`} className="text-sm font-medium text-slate-800">
                      会社名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`employment-company-${index}`}
                      value={row.company}
                      onChange={(event) => handleEmploymentChange(index, "company", event.target.value)}
                      className={`rounded-md border px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                        errors.company ? "border-red-400" : "border-slate-200"
                      }`}
                      aria-invalid={errors.company ? "true" : undefined}
                    />
                    {errors.company ? <p className="text-xs text-red-600">{errors.company}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`employment-role-${index}`} className="text-sm font-medium text-slate-800">
                      役割 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`employment-role-${index}`}
                      value={row.role}
                      onChange={(event) => handleEmploymentChange(index, "role", event.target.value)}
                      className={`rounded-md border px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                        errors.role ? "border-red-400" : "border-slate-200"
                      }`}
                      aria-invalid={errors.role ? "true" : undefined}
                    />
                    {errors.role ? <p className="text-xs text-red-600">{errors.role}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`employment-start-${index}`} className="text-sm font-medium text-slate-800">
                      開始年月 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`employment-start-${index}`}
                      type="month"
                      value={row.start}
                      onChange={(event) => handleEmploymentChange(index, "start", event.target.value)}
                      className={`rounded-md border px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                        errors.start ? "border-red-400" : "border-slate-200"
                      }`}
                      aria-invalid={errors.start ? "true" : undefined}
                    />
                    {errors.start ? <p className="text-xs text-red-600">{errors.start}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`employment-end-${index}`} className="text-sm font-medium text-slate-800">
                      終了年月 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`employment-end-${index}`}
                      type="month"
                      value={row.end}
                      onChange={(event) => handleEmploymentChange(index, "end", event.target.value)}
                      className={`rounded-md border px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                        errors.end ? "border-red-400" : "border-slate-200"
                      }`}
                      aria-invalid={errors.end ? "true" : undefined}
                    />
                    {errors.end ? <p className="text-xs text-red-600">{errors.end}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`employment-status-${index}`} className="text-sm font-medium text-slate-800">
                      状況 <span className="text-red-500">*</span>
                    </label>
                    <select
                      id={`employment-status-${index}`}
                      value={row.status}
                      onChange={(event) => handleEmploymentChange(index, "status", event.target.value as EmploymentStatus)}
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      {employmentOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setEmploymentRows((prev) => {
                        const next = prev.filter((_, rowIndex) => rowIndex !== index);
                        return next.length > 0 ? next : [createEmploymentRow()];
                      })
                    }
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
            onClick={() => setEmploymentRows((prev) => [...prev, createEmploymentRow()])}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            行を追加
          </button>
        </div>
      </FormSection>
      <FormSection title="履歴書：資格・免許" description="取得した資格を入力してください。">
        <div className="space-y-6">
          {licenseRows.map((row, index) => {
            const errors = licenseErrors[index] ?? {};
            return (
              <div key={`license-${index}`} className="rounded-lg border border-slate-200 p-4 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`license-name-${index}`} className="text-sm font-medium text-slate-800">
                      資格・免許名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`license-name-${index}`}
                      value={row.name}
                      onChange={(event) => handleLicenseChange(index, "name", event.target.value)}
                      className={`rounded-md border px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                        errors.name ? "border-red-400" : "border-slate-200"
                      }`}
                      aria-invalid={errors.name ? "true" : undefined}
                    />
                    {errors.name ? <p className="text-xs text-red-600">{errors.name}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`license-obtained-${index}`} className="text-sm font-medium text-slate-800">
                      取得日 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`license-obtained-${index}`}
                      type="date"
                      value={row.obtainedOn}
                      onChange={(event) => handleLicenseChange(index, "obtainedOn", event.target.value)}
                      className={`rounded-md border px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                        errors.obtainedOn ? "border-red-400" : "border-slate-200"
                      }`}
                      aria-invalid={errors.obtainedOn ? "true" : undefined}
                    />
                    {errors.obtainedOn ? <p className="text-xs text-red-600">{errors.obtainedOn}</p> : null}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setLicenseRows((prev) => {
                        const next = prev.filter((_, rowIndex) => rowIndex !== index);
                        return next.length > 0 ? next : [createLicenseRow()];
                      })
                    }
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
            onClick={() => setLicenseRows((prev) => [...prev, createLicenseRow()])}
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
          <Link
            href="/resume/pr"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            次へ（自己PR）
          </Link>
        </div>
      </div>
      {saved ? (
        <div className="fixed bottom-6 right-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          保存しました
        </div>
      ) : null}
    </form>
  );
}
