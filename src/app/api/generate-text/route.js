import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

const MODEL = process.env.GOOGLE_GENAI_MODEL || 'gemini-1.5-flash';
const API_KEY = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

function buildFallbackPrompt(keywords = '', context = {}) {
  const histories = Array.isArray(context?.histories) ? context.histories : [];
  const workHistoryText = histories
    .filter((history) => history?.description)
    .map((history) => `${history.year || ''}年${history.month || ''}月 ${history.description}`)
    .join('\n');

  return `あなたは優秀なキャリアアドバイザーです。\n以下の情報を基に、日本の就職活動で通用する、自然で説得力のある「自己PR」を200〜300字程度で作成してください。\n\n# 職務経歴\n${workHistoryText || '記載なし'}\n\n# アピールしたいキーワード\n${keywords || '指定なし'}`;
}

export async function POST(request) {
  try {
    const { prompt = '', keywords = '', context = {} } = await request.json();
    let preparedPrompt = (prompt || '').trim();

    if (!preparedPrompt) {
      if (!keywords.trim()) {
        return NextResponse.json(
          { error: 'プロンプトが指定されていません。' },
          { status: 400 }
        );
      }
      preparedPrompt = buildFallbackPrompt(keywords, context);
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Gemini APIキーが未設定です。' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(preparedPrompt);
    const generatedText = result?.response?.text?.() ?? '';

    return NextResponse.json({ generatedText });
  } catch (error) {
    console.error('generate-text error', error);
    return NextResponse.json(
      { error: 'AI文章の生成中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
