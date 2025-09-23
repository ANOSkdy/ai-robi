import React from 'react';

export default function ButtonGroup({
  onDownloadResume,
  onDownloadJob,
  onBack,
}) {
  return (
    <div className="button-group" role="group" aria-label="結果画面の操作">
      <button
        type="button"
        id="download-resume-button"
        className="primary-btn"
        onClick={() => onDownloadResume('resume')}
      >
        PDFダウンロード（履歴書）
      </button>
      <button
        type="button"
        id="download-job-button"
        className="primary-btn"
        onClick={() => onDownloadJob('job')}
      >
        PDFダウンロード（職務経歴書）
      </button>
      <button
        type="button"
        id="back-button"
        className="secondary-btn"
        onClick={onBack}
      >
        戻る
      </button>
    </div>
  );
}
