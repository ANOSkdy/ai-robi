// src/components/JobPreview.js
"use client";

import React from 'react';
import { useResumeStore } from '@/store/resumeStore';

const JobPreview = React.forwardRef((props, ref) => {
  const {
    jobSummary,
    jobCompanyDetail,
    jobKnowledge,
    jobSelfPr,
    setJobSummary,
    setJobCompanyDetail,
    setJobKnowledge,
    setJobSelfPr,
  } = useResumeStore();

  return (
    <div ref={ref} className="resume-container">
      <div className="title-row">
        <h1>職 務 経 歴 書</h1>
        <div />
      </div>

      <section className="free-text-grid motivation-grid">
        <div className="cell f-header">職務要約</div>
        <div
          className="cell f-content"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setJobSummary(e.currentTarget.innerText)}
          data-placeholder="履歴書の内容を踏まえて200字程度でまとめてください。"
        >
          {jobSummary}
        </div>
      </section>

      <section className="free-text-grid requests-grid">
        <div className="cell f-header">所属した会社それぞれの職務内容</div>
        <div
          className="cell f-content"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setJobCompanyDetail(e.currentTarget.innerText)}
          data-placeholder="期間／役割／実績などを箇条書きで記載してください。"
        >
          {jobCompanyDetail}
        </div>
      </section>

      <section className="free-text-grid requests-grid">
        <div className="cell f-header">活かせる経験知識</div>
        <div
          className="cell f-content"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setJobKnowledge(e.currentTarget.innerText)}
          data-placeholder="3〜4項目を目安に、経験と知識を具体的に記載してください。"
        >
          {jobKnowledge}
        </div>
      </section>

      <section className="free-text-grid requests-grid">
        <div className="cell f-header">自己PR</div>
        <div
          className="cell f-content"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setJobSelfPr(e.currentTarget.innerText)}
          data-placeholder="具体例と定量成果を織り交ぜて200〜300字程度で記載してください。"
        >
          {jobSelfPr}
        </div>
      </section>
    </div>
  );
});

JobPreview.displayName = 'JobPreview';
export default JobPreview;
