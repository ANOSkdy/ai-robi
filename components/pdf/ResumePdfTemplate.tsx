import type { ResumeFormData } from '@/lib/schema';

export function renderResumePdf(data: ResumeFormData): string {
  const bday = `${data.birth_year}/${data.birth_month}/${data.birth_day}`;
  const historyRows = (data.history ?? [])
    .map(
      (h) =>
        `<tr><td>${escapeHtml(h.year)}</td><td>${escapeHtml(h.month)}</td><td>${escapeHtml(h.status)}</td><td>${escapeHtml(h.description)}</td></tr>`,
    )
    .join('');

  const photoSrc = normalizePhoto(data.photo);
  const photo = photoSrc
    ? `<img src="${photoSrc}" alt="photo" />`
    : '<div class="ph">写真</div>';

  return `<!doctype html><html><head><meta charSet="utf-8" /><style>${css}</style><title>履歴書</title></head><body>
    <h1>履歴書</h1>
    <section class="row">
      <div class="col">
        <table class="kv"><tbody>
          <tr><th>氏名</th><td>${escapeHtml(data.name)}</td></tr>
          <tr><th>ふりがな</th><td>${escapeHtml(data.name_furigana)}</td></tr>
          <tr><th>生年月日</th><td>${escapeHtml(bday)}</td></tr>
          <tr><th>性別</th><td>${escapeHtml(data.gender ?? '')}</td></tr>
          <tr><th>現住所</th><td>${escapeHtml(data.address_postal_code)}　${escapeHtml(data.address_main)}</td></tr>
          <tr><th>ふりがな</th><td>${escapeHtml(data.address_furigana)}</td></tr>
          <tr><th>電話</th><td>${escapeHtml(data.phone)}</td></tr>
          <tr><th>メール</th><td>${escapeHtml(data.email)}</td></tr>
        </tbody></table>
      </div>
      <div class="col photo">${photo}</div>
    </section>
    <h2>学歴・職歴</h2>
    <table class="grid"><thead><tr><th>年</th><th>月</th><th>区分</th><th>内容</th></tr></thead><tbody>${historyRows}</tbody></table>
    <h2>自己PR</h2>
    <p class="pre">${escapeHtml(data.generated_resume_pr ?? '')}</p>
    <h2>本人希望欄</h2>
    <p class="pre">${escapeHtml(data.special_requests ?? '')}</p>
  </body></html>`;
}

function escapeHtml(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  .pre { white-space: pre-wrap; }
`;

function normalizePhoto(value: string | undefined | null): string | null {
  if (!value) return null;
  if (value.startsWith('data:')) return value;
  if (/^https?:\/\//.test(value)) return value;
  const clean = value.replace(/^base64,?/i, '').trim();
  if (!clean) return null;
  return `data:image/jpeg;base64,${clean}`;
}

