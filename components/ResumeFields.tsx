'use client';
import { useEffect, type CSSProperties } from 'react';
import { useFormContext } from 'react-hook-form';
import PhotoUpload from './PhotoUpload';
import DynamicHistoryFields from './DynamicHistoryFields';
import AiResumePr from './AiResumePr';

export default function ResumeFields() {
  const { register, formState: { errors }, watch, setValue } = useFormContext();
  const same = watch('same_as_current_address') as boolean | undefined;
  const addressPostal = watch('address_postal_code') as string | undefined;
  const addressMain = watch('address_main') as string | undefined;
  const addressFurigana = watch('address_furigana') as string | undefined;
  const phone = watch('phone') as string | undefined;
  const email = watch('email') as string | undefined;

  useEffect(() => {
    if (same) {
      setValue('contact_address_postal_code', addressPostal);
      setValue('contact_address_main', addressMain);
      setValue('contact_address_furigana', addressFurigana);
      setValue('contact_phone', phone);
      setValue('contact_email', email);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [same, addressPostal, addressMain, addressFurigana, phone, email]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={card}>
        <h3 style={h3}>基本情報</h3>
        <div style={grid2}>
          <div style={col}>
            <label>氏名</label>
            <input {...register('name')} />
            <FieldError error={errors.name} />
          </div>
          <div style={col}>
            <label>ふりがな</label>
            <input {...register('name_furigana')} />
            <FieldError error={errors.name_furigana} />
          </div>
          <div style={col}>
            <label>生年月日（年/月/日）</label>
            <div style={{ display:'flex', gap:8 }}>
              <input placeholder="YYYY" {...register('birth_year')} style={{ width:120 }} />
              <input placeholder="MM" {...register('birth_month')} style={{ width:80 }} />
              <input placeholder="DD" {...register('birth_day')} style={{ width:80 }} />
            </div>
            <FieldError error={errors.birth_year ?? errors.birth_month ?? errors.birth_day} />
          </div>
          <div style={col}>
            <label>性別</label>
            <select {...register('gender')}>
              <option value="未選択">未選択</option>
              <option value="男性">男性</option>
              <option value="女性">女性</option>
              <option value="その他">その他</option>
            </select>
          </div>
        </div>
        <PhotoUpload />
      </section>

      <section style={card}>
        <h3 style={h3}>現住所</h3>
        <div style={grid2}>
          <div style={col}>
            <label>郵便番号</label>
            <input {...register('address_postal_code')} />
            <FieldError error={errors.address_postal_code} />
          </div>
          <div style={col}>
            <label>住所</label>
            <input {...register('address_main')} />
            <FieldError error={errors.address_main} />
          </div>
          <div style={col}>
            <label>ふりがな</label>
            <input {...register('address_furigana')} />
            <FieldError error={errors.address_furigana} />
          </div>
          <div style={col}>
            <label>電話番号</label>
            <input {...register('phone')} />
            <FieldError error={errors.phone} />
          </div>
          <div style={col}>
            <label>メール</label>
            <input {...register('email')} />
            <FieldError error={errors.email} />
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>
            <input type="checkbox" {...register('same_as_current_address')} /> 連絡先＝現住所と同じ
          </label>
        </div>
        {!same && (
          <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
            <h4 style={{ margin: 0 }}>連絡先</h4>
            <div style={grid2}>
              <div style={col}><label>郵便番号</label><input {...register('contact_address_postal_code')} /></div>
              <div style={col}><label>住所</label><input {...register('contact_address_main')} /></div>
              <div style={col}><label>ふりがな</label><input {...register('contact_address_furigana')} /></div>
              <div style={col}><label>電話番号</label><input {...register('contact_phone')} /></div>
              <div style={col}><label>メール</label><input {...register('contact_email')} /></div>
            </div>
          </div>
        )}
      </section>

      <section style={card}>
        <DynamicHistoryFields />
      </section>

      <section style={card}>
        <h3 style={h3}>免許・資格</h3>
        {/* 簡易：資格もhistoryと同様にuseFieldArrayにしてもよいが、必要最低限の入力欄を提供 */}
        <p style={{ opacity: .7 }}>※必要に応じて上段の学歴・職歴欄に統合しても構いません。</p>
      </section>

      <section style={card}>
        <AiResumePr />
      </section>

      <section style={card}>
        <h3 style={h3}>本人希望欄</h3>
        <textarea rows={4} {...register('special_requests')} />
      </section>
    </div>
  );
}

function FieldError({ error }: { error?: unknown }) {
  const message = getErrorMessage(error);
  if (!message) return null;
  return <p style={{ color: 'crimson', margin: 0 }}>{message}</p>;
}

function getErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (Array.isArray(error)) {
    for (const entry of error) {
      const msg = getErrorMessage(entry);
      if (msg) return msg;
    }
    return undefined;
  }
  if (typeof error === 'object') {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string') return maybeMessage;
    if (maybeMessage) return getErrorMessage(maybeMessage);
  }
  return undefined;
}

const card: CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.03)' };
const grid2: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const col: CSSProperties = { display: 'grid', gap: 6 };
const h3: CSSProperties = { marginTop: 0 };

