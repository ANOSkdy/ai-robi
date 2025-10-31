'use client';
import { type CSSProperties } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

export default function DynamicHistoryFields() {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'history' });

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h3 style={{ margin: 0 }}>学歴・職歴</h3>
        <button type="button" onClick={() => append({ year: '', month: '', description: '', status: '入学' })}>追加</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>年</th>
            <th style={th}>月</th>
            <th style={th}>区分</th>
            <th style={th}>内容</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f, i) => (
            <tr key={f.id}>
              <td style={td}><input style={input} {...register(`history.${i}.year` as const)} /></td>
              <td style={td}><input style={input} {...register(`history.${i}.month` as const)} /></td>
              <td style={td}><input style={input} {...register(`history.${i}.status` as const)} /></td>
              <td style={td}><input style={input} {...register(`history.${i}.description` as const)} /></td>
              <td style={td}><button type="button" onClick={() => remove(i)}>削除</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: CSSProperties = { borderBottom: '1px solid #e5e7eb', textAlign: 'left', padding: 8, fontWeight: 600 };
const td: CSSProperties = { borderBottom: '1px solid #f1f5f9', padding: 8, verticalAlign: 'top' };
const input: CSSProperties = { width: '100%' };

