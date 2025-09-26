// src/components/ResumeAIForm.js
"use client";

import React, { useMemo, useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';

const QUESTIONS = [
  {
    id: 'strength',
    label: 'あなたの強みを一言で教えてください。',
    placeholder: '例：課題発見力／巻き込み力 など',
  },
  {
    id: 'episode',
    label: 'その強みを最も発揮できた具体的な経験を教えてください。',
    placeholder: '役割・工夫・状況など、できるだけ具体的に記載してください。',
  },
  {
    id: 'result',
    label: 'その経験の定量的な成果（数値・比率・KPI改善など）は何ですか？',
    placeholder: '数値や指標がなければ、出来るだけ具体的に記載してください。',
  },
  {
    id: 'value',
    label: '仕事を進めるうえで大切にしているスタンスや価値観は何ですか？',
    placeholder: '例：顧客志向／品質重視／速度重視 など',
  },
  {
    id: 'vision',
    label: '志望する業界・職種で、その強みをどう活かせると考えますか？',
    placeholder: '入社後の活躍イメージを具体的に記載してください。',
  },
];

const extractSection = (text, heading) => {
  if (!text) return '';
  const pattern = new RegExp(`■${heading}\\s*([\\s\\S]*?)(?=\n■|$)`, 'u');
  const match = text.match(pattern);
  if (match) return match[1].trim();
  return '';
};

const buildPrompt = (answers) => {
  const lines = answers.map((answer, index) => `${index + 1}) ${answer.trim()}`);
  return `【指示】以下の回答をもとに、日本の就職活動向けの「志望動機」と「自己PR」を生成してください。\n- 文章は事実ベースで、ハルシネーションは厳禁。\n- 各セクションは見出し（■志望動機／■自己PR）で分ける。\n- 自己PRには具体例と定量成果を入れる。200～300字程度。\n- 読み手は企業の決裁権者。簡潔・明瞭で説得的な文体。\n\n【回答（履歴書用5問）】\n${lines.join('\n')}`;
};

const ResumeAIForm = () => {
  const { updateMotivation, updateSelfPromotion } = useResumeStore();
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState(() => QUESTIONS.map(() => ''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isReady = useMemo(() => answers.every((answer) => answer.trim().length > 0), [answers]);

  const handleChange = (index, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isReady) {
      setError('すべての質問に回答してください。');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const prompt = buildPrompt(answers);
      const res = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, temperature: 0.2 }),
      });
      if (!res.ok) {
        const message = await res.json().catch(() => ({}));
        throw new Error(message.error || 'AI生成に失敗しました。');
      }
      const data = await res.json();
      const text = (data.generatedText || '').trim();
      let motivation = extractSection(text, '志望動機');
      let selfPr = extractSection(text, '自己PR');
      if (!motivation && text) {
        const parts = text.split(/■/).filter(Boolean);
        if (parts.length > 0) {
          motivation = parts[0].replace(/^志望動機/, '').trim();
        }
      }
      if (!selfPr && text) {
        const parts = text.split(/■/).filter(Boolean);
        if (parts.length > 1) {
          selfPr = parts[1].replace(/^自己PR/, '').trim();
        }
      }
      updateMotivation(motivation || text);
      updateSelfPromotion(selfPr || text);
      setOpen(false);
    } catch (err) {
      setError(err.message || 'AI生成に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setError('');
  };

  return (
    <div className="ai-form">
      <button
        type="button"
        className="ai-trigger-btn"
        onClick={() => setOpen(true)}
      >
        AIで志望動機・自己PRを生成
      </button>
      {open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="resume-ai-title">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2 id="resume-ai-title">AI-ROBI 質問モーダル（履歴書）</h2>
              <button type="button" className="modal-close" onClick={handleClose} aria-label="モーダルを閉じる">
                ×
              </button>
            </div>
            <div className="modal-body">
              {QUESTIONS.map((question, index) => (
                <div className="question-item" key={question.id}>
                  <label htmlFor={`resume-question-${question.id}`}>{question.label}</label>
                  <textarea
                    id={`resume-question-${question.id}`}
                    value={answers[index]}
                    onChange={(event) => handleChange(index, event.target.value)}
                    placeholder={question.placeholder}
                    rows={3}
                    required
                  />
                </div>
              ))}
              {error && <p className="modal-error">{error}</p>}
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={handleClose} disabled={loading}>
                キャンセル
              </button>
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? '生成中…' : '生成する'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ResumeAIForm;
