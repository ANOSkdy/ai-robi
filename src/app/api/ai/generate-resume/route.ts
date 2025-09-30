export const runtime = "nodejs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { withBackoff } from "@/lib/utils/backoff";
import { zResumePR } from "@/lib/validate/zod";

const SYSTEM = `
あなたは日本語で出力するキャリアアドバイザーです。事実以外は書きません。
出力は純テキストのみ。余分な前置き・記号・コードブロックは禁止。
`;

const USER_TEMPLATE = (answers: string[]) => `
【入力（5つの回答）】
1) 強み: ${answers[0]}
2) 成果: ${answers[1]}
3) チーム貢献: ${answers[2]}
4) 活かせる経験: ${answers[3]}
5) 志望動機: ${answers[4]}

【指示】
- 200〜300字の日本語の自己PRに要約する
- 事実のみ。誇張・曖昧な推測は禁止
- 箇条書きにしない（段落1つ）
- 可能なら数値や具体例を残す
- 語尾はです/ます調で丁寧に
`;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = zResumePR.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const key: string = process.env.GEMINI_API_KEY ?? "";
  const isMock = process.env.MOCK_AI === "1";
  if (!key) {
    if (isMock) {
      return Response.json({
        prText: "Mock resume preview: Experienced product strategist with eight years leading cross-functional web platform teams, aligning engineering, design, and sales to ship secure releases, improve onboarding by 35 percent, and mentor successors for sustainable growth."
      });
    }
    return Response.json({ error: "AI key is not configured" }, { status: 502 });
  }

  if (isMock) {
    return Response.json({
      prText: "Mock resume preview: Experienced product strategist with eight years leading cross-functional web platform teams, aligning engineering, design, and sales to ship secure releases, improve onboarding by 35 percent, and mentor successors for sustainable growth."
    });
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: SYSTEM,
  });

  const prompt = USER_TEMPLATE(parsed.data.answers);

  try {
    const text = await withBackoff(async () => {
      const res = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 512, temperature: 0.3 },
      });
      return res.response.text();
    });

    const cleaned = text.replace(/```json\s*|```/g, "").trim();
    return Response.json({ prText: cleaned });
  } catch (error) {
    console.error("generate-resume failed", error);
    return Response.json({ error: "AI generation failed" }, { status: 502 });
  }
}
