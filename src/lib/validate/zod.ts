import { z } from "zod";

/** 履歴書 基本情報 */
export const zResumeProfile = z.object({
  name: z.string().min(1, "氏名は必須です").max(80),
  birthday: z.string().min(1, "生年月日は必須です"),
  address: z.string().min(1, "住所は必須です").max(200),
  phone: z.string().min(1, "電話番号は必須です").max(40),
  email: z.string().email("メール形式が不正です"),
  photoUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
});

/** 学歴・職歴エントリ */
export const zEduWorkEntry = z.object({
  start: z.string().min(1, "開始年月は必須です"),
  end: z.string().optional(),
  title: z.string().min(1, "内容は必須です").max(120),
  detail: z.string().max(500).optional(),
  status: z.enum(["入学", "卒業", "中途退学", "入社", "退社", "開業", "閉業"]).optional(),
});

/** 免許・資格 */
export const zLicenseEntry = z.object({
  name: z.string().min(1, "資格名は必須です").max(120),
  acquiredOn: z.string().optional(),
});

/** 自己PR（5回答＋生成文） */
export const zResumePR = z.object({
  answers: z.array(z.string().max(400)).length(5, "5つの回答が必要です"),
  generated: z.string().optional(),
});

export const zResumePRAnswers = zResumePR.shape.answers;

/** 履歴書フォーム全体 */
export const zResumeForm = z.object({
  profile: zResumeProfile,
  education: z.array(zEduWorkEntry),
  work: z.array(zEduWorkEntry),
  licenses: z.array(zLicenseEntry),
  pr: zResumePR,
});

/** 職務経歴（会社単位） */
export const zCareerCompany = z.object({
  company: z.string().min(1, "会社名は必須です"),
  period: z.string().min(1, "期間は必須です"),
  role: z.string().min(1, "役割は必須です"),
  achievements: z.array(z.string().max(400)).min(1, "実績を1つ以上入力してください"),
});

export const zCareerForm = z.object({
  profile: zResumeProfile.partial(),
  companies: z.array(zCareerCompany),
});
