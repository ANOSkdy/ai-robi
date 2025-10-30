export const runtime = 'edge';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Body = {
  strengths: string; episode: string; values: string; contribution: string; goal: string;
};

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) return new Response('Missing GOOGLE_API_KEY', { status: 500 });

  const input = await req.json() as Body;
  const gen = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = [
    '以下の5項目を基に、日本語で300〜400字の自己PRを1段落で作成してください。',
    `強み: ${input.strengths}`,
    `エピソード: ${input.episode}`,
    `価値観: ${input.values}`,
    `企業への貢献: ${input.contribution}`,
    `転職で実現したいこと: ${input.goal}`
  ].join('\n');

  const res = await gen.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
  return Response.json({ text: res.response.text().trim() });
}
