import type { ResumeFormData } from '@/lib/schema';

export function renderCvPdf(data: ResumeFormData): string {
  return `<!doctype html><html><head><meta charSet="utf-8" /><style>${css}</style><title>職務経歴書</title></head><body>
    <h1>職務経歴書</h1>
    <p class="name">${escapeHtml(data.name)}</p>

    <h2>要約</h2>
    <p class="pre">${escapeHtml(data.generated_cv_summary ?? '')}</p>

    <h2>詳細</h2>
    <p class="pre">${escapeHtml(data.generated_cv_details ?? '')}</p>

    <h2>スキル</h2>
    <p class="pre">${escapeHtml(data.generated_cv_skills ?? '')}</p>

    <h2>自己PR</h2>
    <p class="pre">${escapeHtml(data.generated_cv_pr ?? '')}</p>
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
  .name { font-weight: 600; margin-top: 0; }
  .pre { white-space: pre-wrap; }
`;

