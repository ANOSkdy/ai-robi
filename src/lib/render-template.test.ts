import { describe, expect, it } from 'vitest';

import { renderTemplate } from './render-template';

describe('renderTemplate', () => {
  const baseData = {
    personal: {
      fullName: '山田 太郎',
      furigana: 'やまだ たろう',
      email: 'taro@example.com',
      phone: '090-0000-0000',
    },
    histories: [
      { year: '2020', month: '03', description: 'サンプル大学 卒業', status: '卒業', type: 'history' },
      { year: '2021', month: '04', description: 'サンプル株式会社 入社', status: '入社', type: 'history' },
    ],
    resume: {
      selfPr: '成果を出しました。',
      answers: {
        achievement: '大きなプロジェクトを成功させました。',
      },
    },
    job: {
      experience: {
        summary: 'BtoB SaaS の営業を担当しました。',
        answers: {
          results: '年間売上120%を達成',
        },
      },
      profile: {
        summary: 'IT企業での経験を活かせます。',
        answers: {
          skills: 'SaaS営業 / チームマネジメント',
        },
      },
      document: '■職務要約\n〇〇株式会社で営業職として活動。',
    },
  } as const;

  it('renders resume template with provided data', async () => {
    const html = await renderTemplate('resume', baseData as unknown as Record<string, unknown>);
    expect(html).toContain('履歴書');
    expect(html).toContain('山田 太郎');
    expect(html).toContain('成果を出しました。');
  });

  it('renders cv template with provided data', async () => {
    const html = await renderTemplate('cv', baseData as unknown as Record<string, unknown>);
    expect(html).toContain('職務経歴書');
    expect(html).toContain('BtoB SaaS の営業を担当しました。');
    expect(html).toContain('■職務要約');
  });
});
