/* eslint-disable @next/next/no-img-element */
'use client';
import { useRef, useState, type ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';

type Props = { name?: string };

export default function PhotoUpload({ name = 'photo' }: Props) {
  const { setValue, watch } = useFormContext();
  const current = watch(name) as string | undefined;
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(current);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function toDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await toDataUrl(f);
    setValue(name, dataUrl, { shouldDirty: true });
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleClick = () => inputRef.current?.click();

  return (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <label className="eco-label">写真アップロード</label>
      <input ref={inputRef} type="file" accept="image/*" onChange={onChange} style={{ display: 'none' }} />
      <img
        src={previewUrl || current || 'https://via.placeholder.com/160x160.png?text=Photo'}
        alt="preview"
        className="eco-photo"
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />
      <button type="button" className="eco-btn" onClick={handleClick}>
        ファイルを選択
      </button>
      <small>※ 4cm×3cm相当の比率推奨</small>
    </div>
  );
}

