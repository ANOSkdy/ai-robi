export const runtime = "nodejs";
import { withBackoff } from "@/lib/utils/backoff";
import { zResumePR } from "@/lib/validate/zod";
import { SYSTEM_PROMPT_RESUME_PR, USER_TEMPLATE_RESUME_PR } from "@/lib/ai/templates/resumePR";
import { generateWithGemini } from "@/lib/ai/client";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = zResumePR.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isMock = process.env.MOCK_AI === "1";
  const prompt = USER_TEMPLATE_RESUME_PR(parsed.data.answers);

  try {
    if (isMock) {
      return Response.json({
        result:
          "Mock resume preview: Experienced product strategist with eight years leading cross-functional web platform teams, aligning engineering, design, and sales to ship secure releases, improve onboarding by 35 percent, and mentor successors for sustainable growth.",
      });
    }

    const text = await withBackoff(async () =>
      generateWithGemini({
        system: SYSTEM_PROMPT_RESUME_PR,
        user: prompt,
        temperature: 0.6,
        maxOutputTokens: 1536,
      }),
    );

    return Response.json({ result: text });
  } catch (error) {
    console.error("generate-resume failed", error);
    return Response.json({ error: "AI generation failed" }, { status: 502 });
  }
}
