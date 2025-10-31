import type { ResumeFormData } from '@/lib/schema';
import React from 'react';

export default function ResumePdfTemplate({ data }: { data: ResumeFormData }) {
  const bday = `${data.birth_year}/${data.birth_month}/${data.birth_day}`;
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <style>{css}</style>
        <title>履歴書</title>
      </head>
      <body>
        <h1>履歴書</h1>
        <section className="row">
          <div className="col">
            <table className="kv">
              <tbody>
                <tr><th>氏名</th><td>{data.name}</td></tr>
                <tr><th>ふりがな</th><td>{data.name_furigana}</td></tr>
                <tr><th>生年月日</th><td>{bday}</td></tr>
                <tr><th>性別</th><td>{data.gender}</td></tr>
                <tr><th>現住所</th><td>{data.address_postal_code}　{data.address_main}</td></tr>
                <tr><th>ふりがな</th><td>{data.address_furigana}</td></tr>
                <tr><th>電話</th><td>{data.phone}</td></tr>
                <tr><th>メール</th><td>{data.email}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="col photo">
            {data.photo ? <img src={data.photo} alt="photo" /> : <div className="ph">写真</div>}
          </div>
        </section>
        <h2>学歴・職歴</h2>
        <table className="grid">
          <thead><tr><th>年</th><th>月</th><th>区分</th><th>内容</th></tr></thead>
          <tbody>
            {data.history?.map((h, i) => (
              <tr key={i}><td>{h.year}</td><td>{h.month}</td><td>{h.status}</td><td>{h.description}</td></tr>
            ))}
          </tbody>
        </table>
        <h2>自己PR</h2>
        <p style={{ whiteSpace: 'pre-wrap' }}>{data.generated_resume_pr || ''}</p>
        <h2>本人希望欄</h2>
        <p style={{ whiteSpace: 'pre-wrap' }}>{data.special_requests || ''}</p>
      </body>
    </html>
  );
}

const css = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,Arial,sans-serif; margin: 24px; font-size: 12px; }
  h1 { font-size: 20px; margin: 0 0 12px; }
  h2 { font-size: 14px; margin: 16px 0 8px; }
  .row { display: flex; gap: 16px; }
  .col { flex: 1; }
  .photo { width: 180px; }
  .photo img { width: 180px; height: 220px; object-fit: cover; border: 1px solid #ddd; }
  .ph { width: 180px; height: 220px; display:flex; align-items:center; justify-content:center; background:#fafafa; border:1px dashed #ddd; color:#888; }
  table { width: 100%; border-collapse: collapse; }
  table.kv th { text-align: left; width: 120px; vertical-align: top; color:#333; }
  table.kv td, table.kv th { border-bottom: 1px solid #eee; padding: 6px 8px; }
  table.grid th, table.grid td { border: 1px solid #e5e7eb; padding: 6px 8px; }
  table.grid th { background: #f8fafc; }
`;

