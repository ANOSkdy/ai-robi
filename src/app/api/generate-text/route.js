import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

const MODEL = process.env.GOOGLE_GENAI_MODEL || 'gemini-1.5-flash';
const API_KEY =
  process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || '';

export async function POST(request) {
  try {
    const { prompt, temperature = 0.5 } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'プロンプトが指定されていません。' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Gemini APIキーが未設定です。' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }]}],
      generationConfig: {
        temperature,
      },
    });
    const generatedText = result?.response?.text?.() || '';

    return NextResponse.json({ generatedText });
  } catch (error) {
    console.error('Gemini APIエラー:', error);
    return NextResponse.json(
      { error: 'AI文章の生成中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}