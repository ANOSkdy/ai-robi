export const runtime = 'edge';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Body = { summary: string; details: string; achievements: string; peer_review: string; expertise: string; };

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) return new Response('Missing GOOGLE_API_KEY', { status: 500 });

  const body = await req.json() as Body;
  const gen = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: 'gemini-2.5-flash' });

  // テンプレのフィールド名（work_summary 等）に“直接”合わせて生成
  const generationConfig: any = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'object',
      properties: {
        work_summary: { type: 'string' },
        work_details: { type: 'string' },
        skills:       { type: 'string' },
        self_pr_cv:   { type: 'string' }
      },
      required: ['work_summary','work_details','skills','self_pr_cv']
    }
  };

  const res = await gen.generateContent({
    contents: [{ role: 'user', parts: [{ text: JSON.stringify(body) }] }],
    generationConfig
  });

  return new Response(res.response.text(), { headers: { 'Content-Type': 'application/json' } });
}
