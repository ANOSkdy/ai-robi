import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

const MODEL = process.env.GOOGLE_GENAI_MODEL || 'gemini-1.5-flash';
const API_KEY =
  process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

const parseSection = (text, label, nextLabel) => {
  const pattern = new RegExp(`#${label}\\s*([\\s\\S]*?)${nextLabel ? `#${nextLabel}` : '$'}`);
  const match = text.match(pattern);
  return (match?.[1] || '').trim();
};

export async function POST(req) {
  try {
    const { keywords = '', context = {}, companies = [], answers = null } =
      await req.json();
    const histories = Array.isArray(context.histories)
      ? context.histories
      : [];

    const entries = histories
      .filter((h) => h?.type !== 'header' && h?.type !== 'footer')
      .map((h) => `${h.year || ''}年${h.month || ''}月: ${h.description || ''}`)
      .join('\n');

    const useCvPrompt = answers && typeof answers === 'object';

    let prompt = '';
    if (useCvPrompt) {
      const safe = {
        q1: answers.q1?.trim() || '',
        q2: answers.q2?.trim() || '',
        q3: answers.q3?.trim() || '',
        q4: answers.q4?.trim() || '',
        q5: answers.q5?.trim() || '',
      };
      const historyContext = entries || '履歴書の職歴データは簡素です。';
      prompt = `あなたは{日本一の転職アドバイザー}です。
以下の制約条件と求職者プロフィールと職務経験をもとに{企業人事が感動するレベル職務経歴書}を出力してください。
【求職者プロフィール】
${safe.q1 || '未回答'}
【職務経験】
直近3社要約: ${safe.q2 || '未回答'}
主要実績: ${safe.q3 || '未回答'}
活かせる経験・知識: ${safe.q4 || '未回答'}
第三者評価: ${safe.q5 || '未回答'}
履歴書の職歴抜粋:
${historyContext}
【職務経歴書の内容】
＃職務要約
＃所属した会社それぞれの職務内容
＃活かせる経験知識
＃自己PR
（以下、依頼どおりの詳細制約を厳守）`.trim();
    } else {
      const promptKeywords = keywords || '（特になし）';
      prompt = `
あなたは日本の採用文書に精通したキャリアコンサルタントです。
以下の「職歴（履歴書の原文）」を読み、職務経歴書の下書きを日本語で作成してください。

# 重要要件
- タイトルは出力しません。返答は本文のみ。
- 返答はプレーンテキスト（コードブロックやJSONは禁止）。
- 見出しは次の2つを必ず用意し、それぞれに本文を書いてください。
  1) 職務経歴要約（3～6行）
  2) 職務経歴詳細（プロジェクトごとに 箇条書きを推奨。役割/担当/実績 を明確に）
- 「職務経歴要約」は履歴書の職歴の流れが分かるように、要約と強みを簡潔に。
- 「職務経歴詳細」は、以下の粒度を参考に書いてください。
  - 期間 / クライアント / 概要 / 役割 / 担当業務 / 実績（数値があれば明記）
- キーワードが指定された場合は、文中に自然に織り込みます。

# 履歴書の職歴（原文）
${entries || '（職歴の記載が少ないため、ポテンシャルや取り組み姿勢が伝わるようにまとめてください）'}

# 追加キーワード
${promptKeywords}

# 出力フォーマット（厳守）
職務経歴要約:
（本文）

職務経歴詳細:
（本文）
`.trim();
    }

    if (!API_KEY) {
      return NextResponse.json(
        {
          ok: false,
          summary: '',
          details: (Array.isArray(companies) ? companies : []).map((c) => ({
            company: c,
            detail: '',
          })),
          cvBody: '',
          error: 'Gemini APIキーが未設定です',
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    const text = result?.response?.text() ?? '';

    if (!useCvPrompt) {
      const summaryMatch = text.match(
        /職務経歴要約:\s*([\s\S]*?)\n\s*職務経歴詳細:/
      );
      const detailsMatch = text.match(/職務経歴詳細:\s*([\s\S]*)$/);
      const summaryText = (summaryMatch?.[1] || '').trim();
      const detailsText = (detailsMatch?.[1] || '').trim();

      const lines = detailsText.split(/\n+/).filter(Boolean);
      const normalized = (Array.isArray(companies) ? companies : []).map((c, i) => ({
        company: c,
        detail: lines[i] || '',
      }));
      return NextResponse.json({ ok: true, summary: summaryText, details: normalized, cvBody: text.trim() });
    }

    const summaryText = parseSection(text, '職務要約', '#所属した会社それぞれの職務内容');
    const companyText = parseSection(
      text,
      '所属した会社それぞれの職務内容',
      '#活かせる経験知識'
    );
    const knowledgeText = parseSection(text, '活かせる経験知識', '#自己PR');
    const prText = parseSection(text, '自己PR');

    const detailLines = companyText.split(/\n+/).filter(Boolean);
    const normalized = (Array.isArray(companies) ? companies : []).map((c, i) => ({
      company: c,
      detail: detailLines[i] || '',
    }));

    const combinedBody = [
      '#職務要約',
      summaryText,
      '#所属した会社それぞれの職務内容',
      companyText,
      '#活かせる経験知識',
      knowledgeText,
      '#自己PR',
      prText,
    ]
      .map((section) => section.trim())
      .filter(Boolean)
      .join('\n');

    return NextResponse.json({
      ok: true,
      summary: summaryText,
      details: normalized,
      cvBody: combinedBody || text.trim(),
    });
  } catch (e) {
    console.error('generate-job error', e);
    return NextResponse.json(
      {
        ok: false,
        summary: '',
        details: (Array.isArray(companies) ? companies : []).map((c) => ({
          company: c,
          detail: '',
        })),
        cvBody: '',
        error: e.message || 'server error',
      },
      { status: 500 }
    );
  }
}

