import { describe, it, expect } from 'vitest';
import { POST } from './route';

describe('generate-job API', () => {
  it('returns structured error when API key missing', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: {
          q1: '大学卒業後に営業職として活躍',
          q2: 'A社 2018-2020 営業マネージャー',
          q3: '社長賞を受賞',
          q4: 'SaaS営業・チームビルディング',
          q5: 'クライアントから高評価',
        },
        context: { histories: [] },
        companies: ['A', 'B'],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({
      ok: false,
      summary: '',
      details: [
        { company: 'A', detail: '' },
        { company: 'B', detail: '' },
      ],
      cvBody: '',
      error: 'Gemini APIキーが未設定です',
    });
  });
});
