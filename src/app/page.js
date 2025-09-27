'use client';

import React, { useEffect, useRef, useState, useId } from 'react';
import { useReactToPrint } from 'react-to-print';
import ResumePreview from '@/components/ResumePreview';
import JobPreview from '@/components/JobPreview';
import { useResumeStore } from '@/store/resumeStore';

export default function Home() {
  // ← v3の新API: contentRef を渡す
  const contentRef = useRef(null);

  const fileInputId = useId();
  const { updatePhotoUrl } = useResumeStore();
  const [mode, setMode] = useState('resume'); // 'resume' | 'job'

  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    if (contentRef.current) setIsReady(true);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: '履歴書',
    removeAfterPrint: true,
  });

  // 画像選択 → Base64化 → store へ保存
  const onPickPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      e.target.value = '';
      return;
    }

    const readAsDataUrl = (blob) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('画像の読み込みに失敗しました。'));
        reader.readAsDataURL(blob);
      });

    const cropToJisRatio = (dataUrl) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const targetRatio = 3 / 4; // 横:縦 = 3:4（縦4:横3）
          const outputWidth = 300;
          const outputHeight = 400;
          const canvas = document.createElement('canvas');
          canvas.width = outputWidth;
          canvas.height = outputHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('画像処理用のコンテキストを取得できませんでした。'));
            return;
          }

          const sourceRatio = img.width / img.height;
          let sx = 0;
          let sy = 0;
          let sw = img.width;
          let sh = img.height;

          if (sourceRatio > targetRatio) {
            // 横長なので左右をトリミング
            sw = img.height * targetRatio;
            sx = (img.width - sw) / 2;
          } else if (sourceRatio < targetRatio) {
            // 縦長なので上下をトリミング
            sh = img.width / targetRatio;
            sy = (img.height - sh) / 2;
          }

          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        };
        img.onerror = () => reject(new Error('画像の読み込みに失敗しました。'));
        img.src = dataUrl;
      });

    try {
      const base64 = await readAsDataUrl(file);
      const cropped = await cropToJisRatio(base64);
      updatePhotoUrl(cropped);
    } catch (err) {
      console.error(err);
      alert(err.message || '画像の処理に失敗しました。');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <main>
      <header className="page-header" style={{ padding: '20px', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>AI-ROBI｜AI履歴書・職務経歴書ジェネレーター</h1>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
          <button
            type="button"
            className="download-btn"
            onClick={() => document.getElementById(fileInputId).click()}
          >
            写真を選択
          </button>
          <input
            id={fileInputId}
            type="file"
            accept="image/*"
            onChange={onPickPhoto}
            style={{ display: 'none' }}
          />

          <button
            onClick={handlePrint}
            className="download-btn"
            disabled={!isReady}
          >
            {isReady ? 'PDFダウンロード' : '準備中...'}
          </button>

          <button
            type="button"
            className="download-btn"
            onClick={() => setMode((m) => (m === 'resume' ? 'job' : 'resume'))}
          >
            {mode === 'resume' ? '職務経歴書へ' : '履歴書へ'}
          </button>
        </div>
      </header>

      {/* 印刷対象 */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {mode === 'resume' ? (
          <ResumePreview ref={contentRef} />
        ) : (
          <JobPreview ref={contentRef} />
        )}
      </div>
    </main>
  );
}
