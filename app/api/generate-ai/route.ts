export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt が不正です' }, { status: 400 });
    }
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_GENAI_API_KEY が未設定です' }, { status: 500 });
    }
    const modelName = process.env.GENAI_MODEL || 'gemini-1.5-pro-latest';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const aiText = result.response.text();
    return NextResponse.json({ aiText });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'AIエラー';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

