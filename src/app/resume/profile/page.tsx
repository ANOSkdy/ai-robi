"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FormSection } from "@/components/ui/FormSection";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import PhotoUploader from "@/components/PhotoUploader";
import { useResumeStore, type Profile } from "@/store/resume";
import { DraftRestoreBanner } from "@/components/DraftRestoreBanner";
import { clearDraft, loadDraft, useAutosave } from "@/hooks/useAutosave";
import { profileSchema, type ProfileFormData } from "./schema";

const STORAGE_KEY = "airobi:resume:profile:v1";

const toFormData = (profile: Profile): ProfileFormData => ({
  name: profile.name ?? "",
  nameKana: profile.nameKana ?? "",
  birth: profile.birth ?? "",
  address: profile.address ?? "",
  phone: profile.phone ?? "",
  email: profile.email ?? "",
  avatarUrl: profile.avatarUrl ?? "",
});

export default function ResumeProfilePage() {
  const { profile, setProfile } = useResumeStore((state) => ({
    profile: state.profile,
    setProfile: state.setProfile,
  }));

  const [formData, setFormData] = useState<ProfileFormData>(() => toFormData(profile));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [draft, setDraft] = useState<{ data?: ProfileFormData; ts?: number }>();

  useEffect(() => {
    setDraft(loadDraft<ProfileFormData>(STORAGE_KEY));
  }, []);

  useAutosave({ key: STORAGE_KEY, data: formData });

  const avatarPreview = useMemo(() => {
    if (!formData.avatarUrl || formData.avatarUrl.trim() === "") return undefined;
    return formData.avatarUrl.trim();
  }, [formData.avatarUrl]);

  const handleChange = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    const result = profileSchema.safeParse({
      ...formData,
      name: formData.name.trim(),
      nameKana: formData.nameKana?.trim() ?? "",
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      birth: formData.birth.trim(),
      avatarUrl: formData.avatarUrl?.trim() ?? "",
    });

    if (!result.success) {
      const errors: Partial<Record<keyof ProfileFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof ProfileFormData;
        errors[key] = issue.message;
      });
      setFieldErrors(errors);
      setErrorMessage("入力内容をご確認ください。");
      return;
    }

    const normalized: Profile = {
      name: result.data.name,
      nameKana: result.data.nameKana?.trim() ? result.data.nameKana.trim() : undefined,
      birth: result.data.birth,
      address: result.data.address,
      phone: result.data.phone,
      email: result.data.email,
      avatarUrl: result.data.avatarUrl?.trim() ? result.data.avatarUrl.trim() : undefined,
    };

    setProfile(normalized);
    clearDraft(STORAGE_KEY);
    setDraft(undefined);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <DraftRestoreBanner
        draft={draft}
        onRestore={(data) => {
          setFormData(data);
          setDraft(undefined);
          setFieldErrors({});
          setErrorMessage("");
        }}
        onDiscard={() => {
          clearDraft(STORAGE_KEY);
          setDraft(undefined);
        }}
      />
      <FormSection title="履歴書：プロフィール" description="基本情報を入力してください。">
        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-800">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                    fieldErrors.name ? "border-red-400" : "border-slate-200"
                  }`}
                  aria-invalid={fieldErrors.name ? "true" : undefined}
                />
                {fieldErrors.name ? <p className="text-xs text-red-600">{fieldErrors.name}</p> : null}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="nameKana" className="text-sm font-medium text-slate-800">
                  フリガナ
                </label>
                <input
                  id="nameKana"
                  name="nameKana"
                  type="text"
                  value={formData.nameKana ?? ""}
                  onChange={(event) => handleChange("nameKana", event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="birth" className="text-sm font-medium text-slate-800">
                  生年月日 <span className="text-red-500">*</span>
                </label>
                <input
                  id="birth"
                  name="birth"
                  type="date"
                  required
                  value={formData.birth}
                  onChange={(event) => handleChange("birth", event.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                    fieldErrors.birth ? "border-red-400" : "border-slate-200"
                  }`}
                  aria-invalid={fieldErrors.birth ? "true" : undefined}
                />
                {fieldErrors.birth ? <p className="text-xs text-red-600">{fieldErrors.birth}</p> : null}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-sm font-medium text-slate-800">
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  required
                  value={formData.phone}
                  onChange={(event) => handleChange("phone", event.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                    fieldErrors.phone ? "border-red-400" : "border-slate-200"
                  }`}
                  aria-invalid={fieldErrors.phone ? "true" : undefined}
                />
                {fieldErrors.phone ? <p className="text-xs text-red-600">{fieldErrors.phone}</p> : null}
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label htmlFor="address" className="text-sm font-medium text-slate-800">
                  住所 <span className="text-red-500">*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={(event) => handleChange("address", event.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                    fieldErrors.address ? "border-red-400" : "border-slate-200"
                  }`}
                  aria-invalid={fieldErrors.address ? "true" : undefined}
                />
                {fieldErrors.address ? <p className="text-xs text-red-600">{fieldErrors.address}</p> : null}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-800">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                    fieldErrors.email ? "border-red-400" : "border-slate-200"
                  }`}
                  aria-invalid={fieldErrors.email ? "true" : undefined}
                />
                {fieldErrors.email ? <p className="text-xs text-red-600">{fieldErrors.email}</p> : null}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <PhotoUploader
              className="space-y-3"
              value={formData.avatarUrl ?? ""}
              onChange={(url) => handleChange("avatarUrl", url)}
              aspect={4 / 3}
            />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-slate-700">写真プレビュー（4:3）</p>
              <div className="relative flex h-full min-h-[200px] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="プロフィール画像プレビュー"
                    width={400}
                    height={300}
                    className="photo-4x3 h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs text-slate-500">画像をアップロードするとプレビューが表示されます。</span>
                )}
              </div>
              {fieldErrors.avatarUrl ? (
                <p className="text-xs text-red-600">{fieldErrors.avatarUrl}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              保存する
            </button>
            <Link
              href="/resume/history"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            >
              次へ（学歴・職歴・資格）
            </Link>
          </div>
        </div>
      </FormSection>
      {saved ? (
        <div className="fixed bottom-6 right-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          保存しました
        </div>
      ) : null}
    </form>
  );
}
