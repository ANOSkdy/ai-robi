export const runtime = 'nodejs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { rateLimit } from '@/lib/utils/rate-limit';
import { withBackoff } from '@/lib/utils/backoff';
import { CVSchema } from '@/lib/ai/schema';
import { buildCvUserPrompt, systemText } from '@/lib/ai/prompt';

export async function POST(req: Request) {
  if (!await rateLimit(req)) {
    return Response.json({ error: 'Too Many Requests' }, { status: 429 });
  }
  const { jobProfile, experiences } = await req.json();

  // P1では user コンテキスト整形は簡略化
  const profileText = JSON.stringify(jobProfile, null, 2);
  const experiencesText = JSON.stringify(experiences, null, 2);
  const prompt = buildCvUserPrompt(profileText, experiencesText);

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    // 鍵未設定時は 502 で通知（設計方針）
    return Response.json({ error: 'AIキー未設定のため生成不可' }, { status: 502 });
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro', systemInstruction: systemText });

  const text = await withBackoff(async () => {
    const res = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.5 }
    });
    return res.response.text();
  });

  try {
    const json = CVSchema.parse(JSON.parse(text));
    return Response.json(json);
  } catch {
    return Response.json({ error: 'AI出力の形式が不正です' }, { status: 502 });
  }
}
