'use client';
import { useState, type ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';

type Props = { name?: string };

export default function PhotoUpload({ name = 'photo' }: Props) {
  const { setValue, watch } = useFormContext();
  const current = watch(name) as string | undefined;
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(current);

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

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={{ fontWeight: 600 }}>写真アップロード</label>
      <input type="file" accept="image/*" onChange={onChange} />
      {previewUrl || current ? (
        <img
          src={previewUrl || current}
          alt="preview"
          style={{ width: 160, height: 160, objectFit: 'cover', border: '1px solid #ddd', borderRadius: 8 }}
        />
      ) : null}
    </div>
  );
}

