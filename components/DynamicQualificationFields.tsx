'use client';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

export default function DynamicQualificationFields() {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'qualifications' });

  // GAS同様、初期表示で1行追加
  useEffect(() => {
    if (fields.length === 0) append({ year: '', month: '', description: '' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h3 className="eco-h3" style={{ margin: 0 }}>免許・資格</h3>
        <button type="button" className="eco-btn eco-btn-primary"
          onClick={() => append({ year: '', month: '', description: '' })}>追加</button>
      </div>
      <table className="eco-table">
        <thead><tr><th>年</th><th>月</th><th>免許・資格</th><th></th></tr></thead>
        <tbody>
          {fields.map((f, i) => (
            <tr key={f.id}>
              <td><input {...register(`qualifications.${i}.year` as const)} /></td>
              <td><input {...register(`qualifications.${i}.month` as const)} /></td>
              <td><input {...register(`qualifications.${i}.description` as const)} /></td>
              <td><button type="button" className="eco-btn eco-btn-danger" onClick={() => remove(i)}>削除</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

