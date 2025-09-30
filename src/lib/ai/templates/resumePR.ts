export const SYSTEM_PROMPT_RESUME_PR = `
あなたは日本の採用文化に精通したキャリアアドバイザーです。
読み手（人事/現場担当）が短時間で理解できる自己PRを作成します。
日本語・敬体（です/ます調）。一文は長くし過ぎない。抽象語を避け、具体例と数値で示す。
STAR法（Situation/Task/Action/Result）要素を含め、3〜5段落・各段落3〜5文。
NG: 誇大表現、断定的な万能感、過度な専門用語の羅列、絵文字、顔文字。
`;

export function USER_TEMPLATE_RESUME_PR(answers: string[]) {
  const labels = ["強み/価値観", "成果の具体例1", "成果の具体例2", "スキル/知識", "志向/貢献意欲"];
  const lines = answers.map((answer, index) => `- ${labels[index]}: ${answer?.trim() ?? ""}`).join("\n");
  return `
以下の素材から、応募書類にそのまま貼れる自己PRを作成してください。

【素材】
${lines}

【出力要件】
- 文字種: 日本語（敬体）
- 構成: 3〜5段落、各段落3〜5文、STAR法の要素を自然に内包
- 表現: 具体的事実/数値/役割を明記。汎用フレーズを避ける
- 書式: Markdownなしのプレーンテキスト。箇条書きは「・」のみ許可
- 長さ目安: 500〜900字
`;
}
