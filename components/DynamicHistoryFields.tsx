'use client';
import { useFieldArray, useFormContext } from 'react-hook-form';

export default function DynamicHistoryFields() {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'history' });

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h3 className="eco-h3" style={{ margin: 0 }}>学歴・職歴</h3>
        <button type="button" className="eco-btn eco-btn-primary" onClick={() => append({ year: '', month: '', description: '', status: '入学' })}>追加</button>
      </div>
      <table className="eco-table">
        <thead>
          <tr>
            <th>年</th>
            <th>月</th>
            <th>区分</th>
            <th>内容</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f, i) => (
            <tr key={f.id}>
              <td><input {...register(`history.${i}.year` as const)} /></td>
              <td><input {...register(`history.${i}.month` as const)} /></td>
              <td><input {...register(`history.${i}.status` as const)} /></td>
              <td><input {...register(`history.${i}.description` as const)} /></td>
              <td><button type="button" className="eco-btn eco-btn-danger" onClick={() => remove(i)}>削除</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
