// src/components/JobPreview.js
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';

function extractCompanies(resume = {}) {
  const list = [];
  if (Array.isArray(resume.employmentHistory)) {
    for (const e of resume.employmentHistory) {
      list.push(e?.company || e?.name || '');
    }
  } else if (Array.isArray(resume.jobs)) {
    for (const j of resume.jobs) {
      list.push(j?.company || j?.name || '');
    }
  } else if (Array.isArray(resume.histories)) {
    let inWork = false;
    const normalize = (s) => (s || '').replace(/[\s\u3000]/g, '');
    for (const h of resume.histories) {
      const desc = h?.description || '';
      if (h.type === 'header' && normalize(desc) === '職歴') {
        inWork = true;
        continue;
      }
      if (!inWork) continue;
      if (h.type === 'footer') break;
      if (h.type === 'entry' && /(入社|入所|配属|参画)/.test(desc)) {
        const name = (desc.split(/[ \u3000]/)[0] || '').trim();
        list.push(name);
      }
    }
  }
  const unique = [...new Set(list)];
  return unique.map((c, i) => c || `会社${i + 1}`);
}

const JobPreview = React.forwardRef((props, ref) => {
  const {
    histories,
    employmentHistory,
    jobs,
    jobSummary,
    jobDetails,
    setJobSummary,
    setJobDetails,
    upsertJobDetail,
    cvBody,
    setCvBody,
  } = useResumeStore();

  const companies = useMemo(
    () => extractCompanies({ histories, employmentHistory, jobs }),
    [histories, employmentHistory, jobs]
  );

  useEffect(() => {
    setJobDetails(jobDetails);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies.join('|')]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cvAnswers, setCvAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const openModal = () => {
    setErr('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!loading) setIsModalOpen(false);
  };

  const handleAnswerChange = (key, value) => {
    setCvAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateAll = async () => {
    setLoading(true);
    setErr('');
    try {
      const payload = {
        answers: Object.fromEntries(
          Object.entries(cvAnswers).map(([k, v]) => [k, v.trim()])
        ),
        context: { histories },
        companies,
      };
      const res = await fetch('/api/generate-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || 'AI生成に失敗しました。');
      }
      const nextSummary = data.summary ?? '';
      let details = Array.isArray(data.details) ? data.details : [];
      if (details.length && typeof details[0] === 'string') {
        details = details.map((d, i) => ({
          company: companies[i] || `会社${i + 1}`,
          detail: d,
        }));
      }
      const normalized = companies.map((company, i) => {
        const found = details.find((d) => d?.company === company);
        return { company, detail: found?.detail || '' };
      });

      setJobSummary(nextSummary);
      setJobDetails(normalized);
      setCvBody(data.cvBody ?? data.fullText ?? data.text ?? '');
      setIsModalOpen(false);
    } catch (e) {
      setErr(e?.message || 'AI生成に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="resume-container">
      <div className="title-row">
        <h1>職 務 経 歴 書</h1>
        <div />
      </div>

      <div className="free-text-grid motivation-grid">
        <div className="cell f-header">職務経歴要約</div>
        <div
          className="cell f-content"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setJobSummary(e.currentTarget.innerText)}
          data-placeholder="履歴書の職歴を参考に、要約を記載します（AIボタンでも自動生成できます）"
        >
          {jobSummary}
        </div>
      </div>

      {companies.map((company, idx) => (
        <div className="free-text-grid requests-grid" key={company + idx}>
          <div className="cell f-header">職務経歴詳細（{company}）</div>
          <div
            className="cell f-content"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => upsertJobDetail(idx, e.currentTarget.innerText)}
            data-placeholder="こちらに当該企業での担当業務・実績・工夫・成果などを記載してください"
          >
            {jobDetails?.[idx]?.detail || ''}
          </div>
        </div>
      ))}

      <div className="ai-controls" style={{ marginTop: 8 }}>
        <button
          onClick={openModal}
          className="ai-generate-btn"
          disabled={loading}
        >
          {loading ? '生成中…' : 'AIで職務経歴書を生成'}
        </button>
        {err && <p className="ai-error-message">{err}</p>}
      </div>

      <div className="free-text-grid requests-grid" style={{ marginTop: 16 }}>
        <div className="cell f-header">職務経歴書本文（AI生成）</div>
        <div
          className="cell f-content"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setCvBody(e.currentTarget.innerText)}
          data-placeholder="AI生成した職務経歴書本文がここに表示されます"
        >
          {cvBody}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <h3>職務経歴 ヒアリング</h3>
            <label>
              Q1 最終学歴/卒業or中退/その後の要約
              <textarea
                rows={2}
                value={cvAnswers.q1}
                onChange={(e) => handleAnswerChange('q1', e.target.value)}
              />
            </label>
            <label>
              Q2 直近3社の在籍・部署/役職・主担当
              <textarea
                rows={3}
                value={cvAnswers.q2}
                onChange={(e) => handleAnswerChange('q2', e.target.value)}
              />
            </label>
            <label>
              Q3 主要実績（定量歓迎）と取り組み
              <textarea
                rows={3}
                value={cvAnswers.q3}
                onChange={(e) => handleAnswerChange('q3', e.target.value)}
              />
            </label>
            <label>
              Q4 活かせる経験・知識（3〜4項目）＋具体例（~150字）
              <textarea
                rows={3}
                value={cvAnswers.q4}
                onChange={(e) => handleAnswerChange('q4', e.target.value)}
              />
            </label>
            <label>
              Q5 他者評価/表彰/査定
              <textarea
                rows={2}
                value={cvAnswers.q5}
                onChange={(e) => handleAnswerChange('q5', e.target.value)}
              />
            </label>
            {err && <p className="ai-error-message" style={{ marginTop: 0 }}>{err}</p>}
            <div className="modal-actions">
              <button
                type="button"
                className="control-btn"
                onClick={closeModal}
                disabled={loading}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="ai-generate-btn"
                onClick={handleGenerateAll}
                disabled={loading}
              >
                {loading ? '生成中…' : 'AIで職務経歴書生成'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

JobPreview.displayName = 'JobPreview';
export default JobPreview;

