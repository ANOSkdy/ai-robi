import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const runtime = "nodejs";

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7;
const MAX_TTL_SECONDS = DEFAULT_TTL_SECONDS;

const profileSchema = z.object({
  name: z.string(),
  nameKana: z.string().optional(),
  birth: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  avatarUrl: z.string().optional(),
});

const educationStatusSchema = z.enum(["入学", "卒業", "中退"]);

const educationEntrySchema = z.object({
  school: z.string(),
  degree: z.string().optional(),
  start: z.string(),
  end: z.string(),
  status: educationStatusSchema,
});

const employmentStatusSchema = z.enum(["入社", "退社", "開業", "閉業"]);

const employmentEntrySchema = z.object({
  company: z.string(),
  role: z.string(),
  start: z.string(),
  end: z.string(),
  status: employmentStatusSchema,
});

const licenseEntrySchema = z.object({
  name: z.string(),
  obtainedOn: z.string(),
});

const jobProfileSchema = z.object({
  title: z.string().optional(),
  summary: z.string().optional(),
  name: z.string().optional(),
});

const cvExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  period: z.string(),
  achievements: z.array(z.string()),
});

const cvStateSchema = z.object({
  jobProfile: jobProfileSchema,
  experiences: z.array(cvExperienceSchema),
});

const shareDataSchema = z.object({
  resume: z.object({
    profile: profileSchema,
    education: z.array(educationEntrySchema),
    employment: z.array(employmentEntrySchema),
    licenses: z.array(licenseEntrySchema),
    prText: z.string(),
  }),
  career: z.object({
    cv: cvStateSchema,
    cvText: z.string(),
  }),
});

const shareRequestSchema = shareDataSchema.extend({
  expireSeconds: z
    .number({ coerce: true })
    .int()
    .positive()
    .max(MAX_TTL_SECONDS)
    .optional(),
});

export type ShareData = z.infer<typeof shareDataSchema>;

const getKvConfig = () => {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error("KV configuration is missing");
  }

  return { url, token };
};

const createShareUrl = (origin: string, token: string) => {
  return `${origin.replace(/\/$/, "")}/share/${token}`;
};

const storeShareData = async (token: string, data: ShareData, ttlSeconds: number) => {
  const { url, token: authToken } = getKvConfig();
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = { data, exp: expiresAt };

  const response = await fetch(`${url}/set/${token}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value: JSON.stringify(payload), ex: ttlSeconds }),
  });

  if (!response.ok) {
    throw new Error("Failed to store share data");
  }
};

export async function POST(request: NextRequest) {
  try {
    const parsed = shareRequestSchema.parse(await request.json());
    const shareToken = uuidv4();
    const ttlSeconds = parsed.expireSeconds ?? DEFAULT_TTL_SECONDS;
    const { resume, career } = parsed;

    await storeShareData(shareToken, { resume, career }, ttlSeconds);

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const url = createShareUrl(origin, shareToken);

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid share payload" }, { status: 400 });
    }

    return NextResponse.json({ message: "Failed to create share link" }, { status: 500 });
  }
}

export { DEFAULT_TTL_SECONDS };
export { shareDataSchema };
