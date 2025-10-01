export const runtime = "nodejs";
import { z } from "zod";
import { withBackoff } from "@/lib/utils/backoff";
import { zCareerForm } from "@/lib/validate/zod";
import { SYSTEM_PROMPT_CAREER, USER_TEMPLATE_CAREER } from "@/lib/ai/templates/career";
import { generateWithGemini } from "@/lib/ai/client";

const zInput = z.object({
  profileBrief: z.string().optional().default(""),
  companies: zCareerForm.shape.companies,
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = zInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isMock = process.env.MOCK_AI === "1";
  const user = USER_TEMPLATE_CAREER(parsed.data.profileBrief, parsed.data.companies);

  try {
    if (isMock) {
      return Response.json({
        result:
          "Mock career preview: Seasoned full-stack engineer leading SaaS transformations, modernizing legacy platforms, and delivering 45% throughput gains while mentoring teams across multiple industries.",
      });
    }

    const text = await withBackoff(async () =>
      generateWithGemini({
        system: SYSTEM_PROMPT_CAREER,
        user,
        temperature: 0.6,
        maxOutputTokens: 2048,
      }),
    );

    return Response.json({ result: text });
  } catch (error) {
    console.error("generate-career failed", error);
    return Response.json({ error: "AI generation failed" }, { status: 502 });
  }
}
