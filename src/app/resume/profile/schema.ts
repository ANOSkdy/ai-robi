import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(1, "氏名は必須です。"),
  nameKana: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  birth: z
    .string()
    .trim()
    .min(1, "生年月日を入力してください。")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "YYYY-MM-DD形式で入力してください。",
    }),
  address: z.string().trim().min(1, "住所を入力してください。"),
  phone: z
    .string()
    .trim()
    .min(1, "電話番号を入力してください。")
    .refine((value) => /[0-9]/.test(value), {
      message: "数字を含めて入力してください。",
    }),
  email: z.string().trim().email("メールアドレスの形式で入力してください。"),
  avatarUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) =>
        !value ||
        value.startsWith("data:image/") ||
        /^https?:\/\//.test(value) ||
        value.startsWith("blob:"),
      {
        message: "有効なURLまたは画像データを入力してください。",
      }
    ),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
