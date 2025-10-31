'use client';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { FieldError as RHFFieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import PhotoUpload from './PhotoUpload';
import DynamicHistoryFields from './DynamicHistoryFields';
import DynamicQualificationFields from './DynamicQualificationFields';
import AiResumePr from './AiResumePr';
import PlantDivider from './PlantDivider';
import LeafIcon from './icons/Leaf';
import DropletIcon from './icons/Droplet';

export default function ResumeFields() {
  const { register, formState: { errors }, watch, setValue } = useFormContext();
  const same = watch('same_as_current_address') as boolean | undefined;

  useEffect(() => {
    if (same) {
      setValue('contact_address_postal_code', watch('address_postal_code'));
      setValue('contact_address_main', watch('address_main'));
      setValue('contact_address_furigana', watch('address_furigana'));
      setValue('contact_phone', watch('phone'));
      setValue('contact_email', watch('email'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [same, watch('address_postal_code'), watch('address_main'), watch('address_furigana'), watch('phone'), watch('email')]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section className="eco-card">
        <h3 className="eco-h3"><LeafIcon width={18} height={18} /> 基本情報</h3>
        <div className="eco-grid2">
          <div className="eco-col">
            <label className="eco-label">氏名</label>
            <input {...register('name')} />
            <FieldError error={errors.name} />
          </div>
          <div className="eco-col">
            <label className="eco-label">ふりがな</label>
            <input {...register('name_furigana')} />
            <FieldError error={errors.name_furigana} />
          </div>
          <div className="eco-col">
            <label className="eco-label">生年月日（年/月/日）</label>
            <div style={{ display:'flex', gap:8 }}>
              <input placeholder="YYYY" {...register('birth_year')} style={{ width:120 }} />
              <input placeholder="MM" {...register('birth_month')} style={{ width:80 }} />
              <input placeholder="DD" {...register('birth_day')} style={{ width:80 }} />
            </div>
            <FieldError error={errors.birth_year || errors.birth_month || errors.birth_day} />
          </div>
          <div className="eco-col">
            <label className="eco-label">性別</label>
            <select {...register('gender')}>
              <option value="未選択">未選択</option>
              <option value="男性">男性</option>
              <option value="女性">女性</option>
              <option value="その他">その他</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <PhotoUpload />
        </div>
      </section>

      <PlantDivider tone="g2" />

      <section className="eco-card">
        <h3 className="eco-h3"><DropletIcon width={18} height={18} /> 現住所</h3>
        <div className="eco-grid2">
          <div className="eco-col">
            <label className="eco-label">郵便番号</label>
            <input {...register('address_postal_code')} />
            <FieldError error={errors.address_postal_code} />
          </div>
          <div className="eco-col">
            <label className="eco-label">住所</label>
            <input {...register('address_main')} />
            <FieldError error={errors.address_main} />
          </div>
          <div className="eco-col">
            <label className="eco-label">ふりがな</label>
            <input {...register('address_furigana')} />
            <FieldError error={errors.address_furigana} />
          </div>
          <div className="eco-col">
            <label className="eco-label">電話番号</label>
            <input {...register('phone')} />
            <FieldError error={errors.phone} />
          </div>
          <div className="eco-col">
            <label className="eco-label">メール</label>
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
            <div className="eco-grid2">
              <div className="eco-col">
                <label className="eco-label">郵便番号</label>
                <input {...register('contact_address_postal_code')} />
                <FieldError error={errors.contact_address_postal_code} />
              </div>
              <div className="eco-col">
                <label className="eco-label">住所</label>
                <input {...register('contact_address_main')} />
                <FieldError error={errors.contact_address_main} />
              </div>
              <div className="eco-col">
                <label className="eco-label">ふりがな</label>
                <input {...register('contact_address_furigana')} />
                <FieldError error={errors.contact_address_furigana} />
              </div>
              <div className="eco-col">
                <label className="eco-label">電話番号</label>
                <input {...register('contact_phone')} />
                <FieldError error={errors.contact_phone} />
              </div>
              <div className="eco-col">
                <label className="eco-label">メール</label>
                <input {...register('contact_email')} />
                <FieldError error={errors.contact_email} />
              </div>
            </div>
          </div>
        )}
      </section>

      <PlantDivider tone="e1" />

      <section className="eco-card">
        <DynamicHistoryFields />
      </section>

      <section className="eco-card">
        <DynamicQualificationFields />
      </section>

      <section className="eco-card">
        <AiResumePr />
      </section>

      <section className="eco-card">
        <h3 className="eco-h3">本人希望欄</h3>
        <textarea rows={4} {...register('special_requests')} />
      </section>
    </div>
  );
}

  type ErrorLike =
    | string
    | RHFFieldError
    | FieldErrorsImpl<Record<string, unknown>>
    | Merge<RHFFieldError, FieldErrorsImpl<Record<string, unknown>>>
    | undefined;

function FieldError({ error }: { error?: ErrorLike }) {
  const message = extractMessage(error);
  if (!message) return null;
  return <p style={{ color: '#8d2f2f', margin: 0 }}>{message}</p>;
}

function extractMessage(error?: ErrorLike): string | undefined {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (typeof (error as RHFFieldError).message === 'string') {
    return (error as RHFFieldError).message;
  }
  if (typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message?: string }).message;
  }
  return undefined;
}
