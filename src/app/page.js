'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import ResumePreview from '@/components/ResumePreview';
import JobPreview from '@/components/JobPreview';
import ResumeAIForm from '@/components/ResumeAIForm';
import CareerAIForm from '@/components/CareerAIForm';
import PhotoUploader from '@/components/PhotoUploader';

export default function Home() {
  const contentRef = useRef(null);
  const [activeTab, setActiveTab] = useState('resume');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isReady && contentRef.current) {
      setIsReady(true);
    }
  }, [activeTab, isReady]);

  const handleSelectTab = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setIsReady(false);
  };

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: activeTab === 'resume' ? '履歴書' : '職務経歴書',
    removeAfterPrint: true,
  });

  return (
    <main>
      <header className="page-header">
        <div className="page-header__top">
          <div className="brand-title" aria-label="サービス名">
            AI-ROBI
          </div>
          <div className="header-actions">
            {activeTab === 'resume' && <PhotoUploader />}
            <button
              type="button"
              className="download-btn"
              onClick={handlePrint}
              disabled={!isReady}
            >
              {isReady ? 'PDFダウンロード' : '準備中...'}
            </button>
          </div>
        </div>
        <nav className="tab-switch" aria-label="書類の切り替え">
          <button
            type="button"
            className={`tab-button ${activeTab === 'resume' ? 'is-active' : ''}`}
            onClick={() => handleSelectTab('resume')}
          >
            履歴書
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'career' ? 'is-active' : ''}`}
            onClick={() => handleSelectTab('career')}
          >
            職務経歴書
          </button>
        </nav>
      </header>

      <section className="tab-tools">
        {activeTab === 'resume' ? <ResumeAIForm /> : <CareerAIForm />}
      </section>

      <div className="preview-wrapper">
        {activeTab === 'resume' ? (
          <ResumePreview ref={contentRef} />
        ) : (
          <JobPreview ref={contentRef} />
        )}
      </div>
    </main>
  );
}
