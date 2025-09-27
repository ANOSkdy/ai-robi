import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = process.env.GOOGLE_GENAI_MODEL || 'gemini-1.5-flash';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      target = 'self_pr',
      keywords = '',
      context = {},
      answers = {},
    } = body;

    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, generatedText: '', error: 'Gemini APIキーが未設定です' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL });

    let prompt = '';

    if (target === 'self_pr') {
      const safeAnswers = {
        q1: answers.q1?.trim() || '',
        q2: answers.q2?.trim() || '',
        q3: answers.q3?.trim() || '',
        q4: answers.q4?.trim() || '',
        q5: answers.q5?.trim() || '',
      };

      const historyText = Array.isArray(context.histories)
        ? context.histories
            .filter((h) => h?.type === 'entry' && h?.description)
            .map((h) => `${h.year || ''}年${h.month || ''}月 ${h.description}`)
            .join('\n')
        : '';
      const licenseText = Array.isArray(context.licenses)
        ? context.licenses
            .filter((l) => l?.description)
            .map((l) => `${l.year || ''}年${l.month || ''}月 ${l.description}`)
            .join('\n')
        : '';

      prompt = `あなたは日本の転職市場に精通したプロのキャリアアドバイザーです。
次の回答をもとに、事実のみでハルシネーションなく200〜300字の「自己PR」を作成してください。
・強み：${safeAnswers.q1 || '未回答'}
・直近の成果：${safeAnswers.q2 || '未回答'}
・他者評価：${safeAnswers.q3 || '未回答'}
・課題解決：${safeAnswers.q4 || '未回答'}
・今後の価値：${safeAnswers.q5 || '未回答'}
追加参考情報（履歴書・免許）:
${historyText || '履歴書の職歴情報なし'}
${licenseText || ''}
制約：具体例・定量を含め、意思決定者に通用する文体。役員が感動するレベル。水平思考で深く考える。定量が無ければ記載を避ける。
出力：自己PRのみ。見出しや余計な文言は不要。`;
    } else {
      if (!keywords) {
        return NextResponse.json(
          { ok: false, generatedText: '', error: 'キーワードが入力されていません。' },
          { status: 400 }
        );
      }

      const workHistoryText = Array.isArray(context.histories)
        ? context.histories
            .filter((h) => h?.type === 'entry' && h?.description)
            .map((h) => `${h.year || ''}年${h.month || ''}月 ${h.description}`)
            .join('\n')
        : '';

      prompt = `あなたは優秀なキャリアアドバイザーです。
以下の情報を基に、日本の就職活動で通用する、自然で説得力のある「自己PR」を200〜300字程度で作成してください。

# 職務経歴
${workHistoryText || '記載なし'}

# アピールしたいキーワード
${keywords}`;
    }

    const result = await model.generateContent(prompt.trim());
    const response = await result.response;
    const generatedText = response.text();

    return NextResponse.json({ ok: true, generatedText });
  } catch (error) {
    console.error('Gemini APIエラー:', error);
    return NextResponse.json(
      { ok: false, generatedText: '', error: 'AI文章の生成中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}