import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

const MODEL = process.env.GOOGLE_GENAI_MODEL || 'gemini-1.5-flash';
const API_KEY = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

export async function POST(request) {
  try {
    const { prompt = '' } = await request.json();
    const preparedPrompt = (prompt || '').trim();

    if (!preparedPrompt) {
      return NextResponse.json(
        { ok: false, generatedText: '', error: 'プロンプトが指定されていません。' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { ok: false, generatedText: '', error: 'Gemini APIキーが未設定です。' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(preparedPrompt);
    const generatedText = result?.response?.text?.() ?? '';

    return NextResponse.json({ ok: true, generatedText });
  } catch (error) {
    console.error('generate-job error', error);
    return NextResponse.json(
      { ok: false, generatedText: '', error: '職務経歴書の生成中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
