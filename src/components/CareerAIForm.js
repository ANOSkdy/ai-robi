// src/components/CareerAIForm.js
"use client";

import React, { useMemo, useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';

const PROFILE_QUESTIONS = [
  {
    id: 'education',
    label: '最終学歴（学校名／学部学科／在籍期間／卒業or中退）',
  },
  {
    id: 'aspiration',
    label: '希望職種・志望業界・3年後の将来像',
  },
  {
    id: 'skills',
    label: '得意分野・専門領域（保有スキル／資格／言語／ツール）',
  },
  {
    id: 'values',
    label: '働く上で重視する価値観',
  },
  {
    id: 'constraints',
    label: '制約事項（転勤可否／リモート希望／就業可能時期など）',
  },
];

const EXPERIENCE_QUESTIONS = [
  {
    id: 'projects',
    label: '直近3案件（または3社）の担当業務・役割（期間・規模）',
  },
  {
    id: 'metrics',
    label: '成果を示す定量指標（売上/コスト/生産性/KPI・OKRなど）',
  },
  {
    id: 'actions',
    label: '成果に至るまでの打ち手（課題→仮説→施策→検証のプロセス）',
  },
  {
    id: 'team',
    label: 'チーム体制・関係者（関与人数・ステークホルダー・連携部門）',
  },
  {
    id: 'lessons',
    label: '失敗や学び（次にどう活かしたか）',
  },
];

const buildSummaryPrompt = (title, answers) => {
  const lines = answers.map((answer, index) => `${index + 1}) ${answer.trim()}`);
  return `あなたは日本の転職支援に精通した編集者です。以下の${title}の回答を200〜300字で要約してください。\n- 事実のみを記載し、誇張や創作は禁止。\n- 箇条書きは使わず、文章でまとめる。\n- 読み手は企業の決裁権者。端的かつ説得力のある文体。\n\n${lines.join('\n')}`;
};

const buildJobPrompt = (profileSummary, experienceSummary) => `あなたは{日本一の転職アドバイザー}です。\n以下の制約条件と求職者プロフィールと職務経験をもとに{企業人事が感動するレベル職務経歴書}を出力してください。\n\n【求職者プロフィール】\n${profileSummary}\n\n【職務経験】\n${experienceSummary}\n\n【職務経歴書の内容】\n＃職務要約\n＃所属した会社それぞれの職務内容\n＃活かせる経験知識\n＃自己PR\n\n【職務要約の制約条件】\n＃最終学歴に該当する〇〇を卒業後、または中途退学の場合は中途退学後からどこで何をしていたのか書き出す\n＃事実のみ記載すること\n＃他者評価を最後に入れること\n＃役員が感動するレベルで書いてください\n＃水平思考で深く考えてください\n＃ハルシネーションしないことを最重要とする\n＃200字程度で記載\n\n【職務内容】\n＃箇条書きで記載\n＃実績を定量で記載すること\n＃実績を出すために行ってきたことを記載すること\n＃定量で記載できるものがなければ記載なし\n＃ハルシネーションしないことを最重要視する\n\n【活かせる経験知識の制約条件】\n＃経験と知識はまとめて書くこと\n＃項目は3〜4個で表示\n＃具体例や実績を盛り込むこと\n＃定性と定量の両面の視点から書くこと\n＃職務経験に定量面の記載がなければ書かないこと\n＃具体例は150字程度で記載\n＃記載できる内容がなければ無理して描かない\n＃事実のみ記載すること\n＃企業の決裁権者に読ませて問題ない文体で書くこと\n＃役員が感動するレベルで書いてください\n＃水平思考で深く考えてください\n＃ハルシネーションしないことを最重要視する\n\n【自己PRの制約条件】\n＃具体例や実績を盛り込むこと\n＃定性と定量の両面の視点から書くこと\n＃企業の決裁権者に読ませて問題ない文体で書くこと\n＃役員が感動するレベルで書いてください\n＃水平思考で深く考えること\n＃職務経験に定量面の記載がなければ書かないこと\n＃ハルシネーションしないことを再重要視すること\n＃事実のみ記載すること\n＃200~300字程度で記載`;

const CareerAIForm = () => {
  const {
    setJobSummary,
    setJobCompanyDetail,
    setJobKnowledge,
    setJobSelfPr,
  } = useResumeStore();

  const [open, setOpen] = useState(false);
  const [profileAnswers, setProfileAnswers] = useState(() => PROFILE_QUESTIONS.map(() => ''));
  const [experienceAnswers, setExperienceAnswers] = useState(() => EXPERIENCE_QUESTIONS.map(() => ''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isReady = useMemo(
    () =>
      profileAnswers.every((answer) => answer.trim()) &&
      experienceAnswers.every((answer) => answer.trim()),
    [profileAnswers, experienceAnswers]
  );

  const handleProfileChange = (index, value) => {
    setProfileAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleExperienceChange = (index, value) => {
    setExperienceAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const requestText = async (prompt) => {
    const res = await fetch('/api/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, temperature: 0.25 }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.error || 'AI生成に失敗しました。');
    }
    const data = await res.json();
    return (data.generatedText || '').trim();
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
      const profileSummary = await requestText(
        buildSummaryPrompt('求職者プロフィール', profileAnswers)
      );
      const experienceSummary = await requestText(
        buildSummaryPrompt('職務経験', experienceAnswers)
      );
      const finalPrompt = buildJobPrompt(profileSummary, experienceSummary);
      const res = await fetch('/api/generate-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || '職務経歴書の生成に失敗しました。');
      }
      const data = await res.json();
      if (data.ok === false) {
        throw new Error(data.error || '職務経歴書の生成に失敗しました。');
      }
      setJobSummary((data.summary || '').trim());
      setJobCompanyDetail((data.detail || '').trim());
      setJobKnowledge((data.knowledge || '').trim());
      setJobSelfPr((data.selfPr || '').trim());
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
        AIで職務経歴書を生成
      </button>
      {open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="career-ai-title">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2 id="career-ai-title">AI-ROBI 質問モーダル（職務経歴書）</h2>
              <button type="button" className="modal-close" onClick={handleClose} aria-label="モーダルを閉じる">
                ×
              </button>
            </div>
            <div className="modal-body">
              <h3 className="modal-subheading">求職者プロフィール（5問）</h3>
              {PROFILE_QUESTIONS.map((question, index) => (
                <div className="question-item" key={question.id}>
                  <label htmlFor={`profile-question-${question.id}`}>{question.label}</label>
                  <textarea
                    id={`profile-question-${question.id}`}
                    value={profileAnswers[index]}
                    onChange={(event) => handleProfileChange(index, event.target.value)}
                    rows={3}
                    required
                  />
                </div>
              ))}
              <h3 className="modal-subheading">職務経験（5問）</h3>
              {EXPERIENCE_QUESTIONS.map((question, index) => (
                <div className="question-item" key={question.id}>
                  <label htmlFor={`experience-question-${question.id}`}>{question.label}</label>
                  <textarea
                    id={`experience-question-${question.id}`}
                    value={experienceAnswers[index]}
                    onChange={(event) => handleExperienceChange(index, event.target.value)}
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

export default CareerAIForm;
