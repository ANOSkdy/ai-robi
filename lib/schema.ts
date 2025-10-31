import { z } from 'zod';

export const historyEntrySchema = z.object({
  year: z.string().min(1, '年を入力してください'),
  month: z.string().min(1, '月を入力してください'),
  description: z.string().min(1, '内容を入力してください'),
  status: z.string(), // 入学/卒業/入社/退社 など
});

export const qualificationEntrySchema = z.object({
  year: z.string().min(1, '年を入力してください'),
  month: z.string().min(1, '月を入力してください'),
  description: z.string().min(1, '内容を入力してください'),
});

export const resumeFormSchema = z.object({
  // 基本情報
  name: z.string().min(1, '氏名を入力してください'),
  name_furigana: z.string().min(1, 'ふりがなを入力してください'),
  birth_year: z.string().min(1, '生年月日（年）を選択してください'),
  birth_month: z.string().min(1, '生年月日（月）を選択してください'),
  birth_day: z.string().min(1, '生年月日（日）を選択してください'),
  gender: z.string(),
  photo: z.string().optional(), // Base64 (data URI)

  // 現住所
  address_postal_code: z.string().min(1, '郵便番号を入力してください'),
  address_main: z.string().min(1, '現住所を入力してください'),
  address_furigana: z.string().min(1, '現住所のふりがなを入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),

  // 連絡先
  same_as_current_address: z.boolean().default(true),
  contact_address_postal_code: z.string().optional(),
  contact_address_main: z.string().optional(),
  contact_address_furigana: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('有効なメールアドレスを入力してください').optional(),

  // 動的フィールド
  history: z.array(historyEntrySchema).default([]),
  qualifications: z.array(qualificationEntrySchema).default([]),

  // AI（履歴書PR）
  q1_resume: z.string().optional(),
  q2_resume: z.string().optional(),
  q3_resume: z.string().optional(),
  q4_resume: z.string().optional(),
  q5_resume: z.string().optional(),
  generated_resume_pr: z.string().optional(),

  // AI（職務経歴書）
  q1_cv: z.string().optional(),
  q2_cv: z.string().optional(),
  q3_cv: z.string().optional(),
  q4_cv: z.string().optional(),
  q5_cv: z.string().optional(),
  generated_cv_summary: z.string().optional(),
  generated_cv_details: z.string().optional(),
  generated_cv_skills: z.string().optional(),
  generated_cv_pr: z.string().optional(),

  // 本人希望欄
  special_requests: z.string().optional(),
});

export type ResumeFormData = z.infer<typeof resumeFormSchema>;

