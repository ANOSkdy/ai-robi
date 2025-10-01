export const SYSTEM_PROMPT_CAREER = `
あなたは日本の転職書類に精通したテクニカルライターです。
職務経歴書を、読みやすく定型的な構成で作成します。
日本語・敬体。各プロジェクトで担当/規模/使用技術/成果(KPI,数値)を端的に。
NG: 誇大表現、冗長な形容、Markdown記号、顔文字。
`;

export function USER_TEMPLATE_CAREER(
  profileBrief: string,
  companies: Array<{ company: string; period: string; role: string; achievements: string[] }>,
) {
  const companyBlocks = companies
    .map((company) => {
      const achievements = company.achievements?.map((achievement) => `・${achievement}`).join("\n") || "";
      return `【会社】${company.company}\n【期間】${company.period}\n【役割】${company.role}\n【実績】\n${achievements}`;
    })
    .join("\n\n");

  return `
以下の素材から職務経歴書本文（プレーンテキスト）を作成してください。

【プロフィール要約】
${profileBrief}

【経歴素材】
${companyBlocks}

【出力要件】
- 構成: 概要/スキルサマリ/職務経歴（会社・案件単位）/自己PR（任意）
- 書式: プレーンテキスト。見出しは全角【】を用いる。箇条書きは「・」のみ
- 各案件: 規模(人数/予算)/役割/使用技術/成果(KPI/数値)/工夫
- 長さ目安: 1200〜2000字
`;
}
