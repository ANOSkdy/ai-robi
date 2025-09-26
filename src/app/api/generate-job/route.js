import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

const MODEL = process.env.GOOGLE_GENAI_MODEL || 'gemini-1.5-flash';
const API_KEY =
  process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { ok: false, error: 'プロンプトが指定されていません。' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { ok: false, error: 'Gemini APIキーが未設定です。' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.4,
      },
    });
    const text = result?.response?.text() ?? '';

    const summary = extractSection(text, '職務要約');
    const detail = extractSection(text, '所属した会社それぞれの職務内容');
    const knowledge = extractSection(text, '活かせる経験知識');
    const selfPr = extractSection(text, '自己PR');

    return NextResponse.json({
      ok: true,
      summary,
      detail,
      knowledge,
      selfPr,
      raw: text,
    });
  } catch (e) {
    console.error('generate-job error', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'server error' },
      { status: 500 }
    );
  }
}

function extractSection(text, heading) {
  const pattern = new RegExp(`＃${heading}\\s*([\\s\\S]*?)(?=\n＃|$)`, 'u');
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

