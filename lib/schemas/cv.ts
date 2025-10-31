import { z } from 'zod';

export const cvBasicSchema = z.object({
  lastName: z.string().min(1, '姓は必須です'),
  firstName: z.string().min(1, '名は必須です'),
  kana: z.string().optional(),
  birthDate: z.string().optional(),
});

export const cvContactSchema = z.object({
  postalCode: z.string().min(1, '郵便番号は必須です'),
  address: z.string().min(1, '住所は必須です'),
  phone: z.string().min(1, '電話は必須です'),
  email: z.string().email('メール形式が不正です'),
});

export const cvEducationItemSchema = z.object({
  school: z.string().min(1, '学校名は必須です'),
  degree: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
});

export const cvPayloadSchema = z.object({
  basic: cvBasicSchema.partial().optional(),
  contact: cvContactSchema.partial().optional(),
  education: z.array(cvEducationItemSchema).optional(),
});

export type CvPayload = z.infer<typeof cvPayloadSchema>;
