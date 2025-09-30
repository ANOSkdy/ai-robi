import { z } from "zod";

export const zYyyyMm = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
export const zYyyyMmDd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const zResumeProfile = z.object({
  name: z.string().min(1).max(64),
  kana: z.string().max(64).optional(),
  birth: zYyyyMmDd,
  address: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().max(32).optional(),
  photoBase64: z.string().max(2_400_000).optional()
});

export const zResumeHistory = z.object({
  yyyymm: zYyyyMm,
  org: z.string().min(1),
  detail: z.string().optional(),
  kind: z.enum(["蜈･蟄ｦ","蜊呈･ｭ","荳ｭ騾秘蟄ｦ","蜈･遉ｾ","騾遉ｾ","髢区･ｭ","髢画･ｭ"])
});

export const zJobExperience = z.object({
  company: z.string().min(1),
  term: z.object({ from: zYyyyMmDd, to: zYyyyMmDd.optional() }),
  role: z.string().optional(),
  tasks: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional()
});

export const zResumePRReq = z.object({
  answers: z.array(z.string()).length(5),
  profile: zResumeProfile,
  history: z.array(zResumeHistory)
});

export const zResumePRAnswers = z.object({
  answers: z.array(z.string()).length(5)
});