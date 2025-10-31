import { z } from 'zod';

export const resumeSkillSchema = z.object({
  name: z.string().min(1, 'スキル名は必須です'),
  level: z.string().optional(),
  description: z.string().optional(),
});

export const resumeHistorySchema = z.object({
  company: z.string().min(1, '会社名は必須です'),
  role: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  detail: z.string().optional(),
});

export const resumePayloadSchema = z.object({
  summary: z.string().min(1, '職務要約は必須です'),
  skills: z.array(resumeSkillSchema).optional(),
  history: z.array(resumeHistorySchema).optional(),
});

export type ResumePayload = z.infer<typeof resumePayloadSchema>;
