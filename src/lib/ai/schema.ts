import { z } from "zod";

export const CVSchema = z.object({
  summary: z.string(),
  companies: z.array(z.object({
    name: z.string(),
    term: z.string(),
    roles: z.array(z.string()),
    tasks: z.array(z.string()),
    achievements: z.array(z.string())
  })),
  leverage: z.array(z.object({
    title: z.string(),
    example: z.string()
  })),
  selfPR: z.string()
});
