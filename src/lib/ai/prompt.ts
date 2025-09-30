export const systemText = `
あなたは{日本一の転職アドバイザー}です。事実以外は出力しないでください。
指定の章立て・字数範囲・表現制約を厳密に守り、JSONのみを返してください。
`;

export const constraintsText = `
【職務経歴書の内容】
＃職務要約（～200字）
＃所属した会社それぞれの職務内容（箇条書き）
＃活かせる経験知識（3〜4項、各～150字）
＃自己PR（200〜300字）
【職務要約の制約条件】
＃最終学歴の卒業／中途退学以降の経歴を事実で記述
＃事実のみ／他者評価を最後に一文
＃ハルシネーション禁止／200字程度
【職務内容】 箇条書き／実績は定量。無ければ記載しない
【活かせる経験知識】 具体例～150字、可能なら定量
【自己PR】 200〜300字、事実のみ、推測禁止
`;

export const buildCvUserPrompt = (profileText: string, experiencesText: string) => `
【求職者プロフィール】
${profileText}

【職務経験】
${experiencesText}

${constraintsText}
`;