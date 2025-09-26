// src/components/PhotoUploader.js
"use client";

import React, { useRef, useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';

const TARGET_WIDTH = 360;
const TARGET_HEIGHT = 480;
const TARGET_RATIO = TARGET_WIDTH / TARGET_HEIGHT; // 3:4

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました。'));
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('画像の読み込みに失敗しました。'));
    image.src = src;
  });

const cropToJis = (image) => {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const ratio = width / height;

  let cropWidth = width;
  let cropHeight = height;
  let offsetX = 0;
  let offsetY = 0;

  if (ratio > TARGET_RATIO) {
    cropHeight = height;
    cropWidth = height * TARGET_RATIO;
    offsetX = (width - cropWidth) / 2;
  } else if (ratio < TARGET_RATIO) {
    cropWidth = width;
    cropHeight = width / TARGET_RATIO;
    offsetY = (height - cropHeight) / 2;
  }

  const canvas = document.createElement('canvas');
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    image,
    offsetX,
    offsetY,
    cropWidth,
    cropHeight,
    0,
    0,
    TARGET_WIDTH,
    TARGET_HEIGHT
  );
  return canvas.toDataURL('image/jpeg', 0.92);
};

const PhotoUploader = () => {
  const fileInputRef = useRef(null);
  const { photoUrl, updatePhotoUrl, clearPhoto } = useResumeStore();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectClick = () => {
    setError('');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください。');
      return;
    }

    try {
      setIsProcessing(true);
      const dataUrl = await readFileAsDataUrl(file);
      const image = await loadImage(dataUrl);
      const processed = cropToJis(image);
      updatePhotoUrl(processed);
      setError('');
    } catch (err) {
      console.error(err);
      setError('画像の処理に失敗しました。別のファイルでお試しください。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    clearPhoto();
    setError('');
  };

  return (
    <div className="photo-uploader" aria-live="polite">
      <div className="photo-uploader__preview" aria-label="証明写真プレビュー">
        {photoUrl ? (
          <img src={photoUrl} alt="証明写真プレビュー" />
        ) : (
          <span>3:4 プレビュー</span>
        )}
      </div>
      <div className="photo-uploader__controls">
        <button
          type="button"
          className="secondary-btn"
          onClick={handleSelectClick}
          disabled={isProcessing}
        >
          {isProcessing ? '処理中…' : '写真を選択'}
        </button>
        {photoUrl && (
          <button
            type="button"
            className="secondary-btn danger"
            onClick={handleClear}
            disabled={isProcessing}
          >
            削除
          </button>
        )}
      </div>
      <p className="photo-uploader__note">JIS規格 3:4（360×480px）に自動補正されます。</p>
      {error && <p className="modal-error" role="alert">{error}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="visually-hidden-file"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
};

export default PhotoUploader;
