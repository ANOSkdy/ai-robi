export const runtime = 'nodejs';

import fs from 'node:fs';
import path from 'node:path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
// @ts-ignore
import ImageModule from 'docxtemplater-image-module-free';

type Req = {
  template: 'resume' | 'cv';
  // 下記 data はテンプレのキーに合わせて渡す:
  // resume: { date_created, name_furigana, name, birth_year, birth_month, birth_day, age, address_*, phone, email, contact_*, generated_pr, special_requests, photoBase64? }
  // cv    : { date_created, name, work_summary, work_details, skills, self_pr_cv }
  data: Record<string, any>;
  photoBase64?: string;
};

function ymdJST(): string {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(jst.getUTCDate()).padStart(2, '0');
  return ${y}//;
}

export async function POST(req: Request) {
  const { template, data, photoBase64 } = await req.json() as Req;

  // サーバ側で date_created を既定（未指定時）
  if (!data.date_created) data.date_created = ymdJST();

  // 履歴書: 年齢自動算出（birth_* が来ている場合）
  if (template === 'resume' && data.birth_year && data.birth_month && data.birth_day) {
    const by = Number(data.birth_year), bm = Number(data.birth_month), bd = Number(data.birth_day);
    const today = new Date();
    let age = today.getFullYear() - by;
    const m = today.getMonth() + 1, d = today.getDate();
    if (m < bm || (m === bm && d < bd)) age--;
    data.age = String(age);
  }

  // 免許・資格の『 取得 』追記に対応したい場合は、テンプレ側に {{licenses_text}} を追加してください。
  // 渡されれば自動で付与・結合します（未使用なら無視されます）
  if (Array.isArray(data.licenses)) {
    const lines = data.licenses
      .map((x: any) => (typeof x === 'string' ? x : x?.title || ''))
      .filter(Boolean)
      .map(s => s.trim().endsWith('取得') ? s.trim() : (s.trim() + ' 取得'));
    data.licenses_text = lines.join('\n');
  }

  // 画像: docxtemplater-image-module-free は {%photo} 記法を使用
  // 現在テンプレは {{photo}} ですが、そのままだと画像は入らず“空文字で消える”だけになります。
  // 画像を差し込みたい場合はテンプレの {{photo}} を {%photo} に変更してください。
  const photoTag = (photoBase64 && photoBase64.startsWith('data:image')) ? photoBase64 : '';
  data.photo = photoTag;       // {%photo} 用
  if (!photoTag) data.photo = ''; // 未アップ時は空 → プレースホルダは消える

  const filePath = path.join(process.cwd(), 'templates', ${template}.docx);
  if (!fs.existsSync(filePath)) return new Response('Template not found', { status: 400 });

  const zip = new PizZip(fs.readFileSync(filePath));

  const imageModule = new ImageModule({
    getImage: (t: string) => {
      if (!t) return null;
      const b64 = t.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      return Buffer.from(b64, 'base64');
    },
    getSize: () => [180, 240]
  });

  const doc = new Docxtemplater();
  doc.attachModule(imageModule);
  doc.loadZip(zip);
  doc.setOptions({ nullGetter: () => '' });
  doc.setData(data);

  try { doc.render(); }
  catch (e: any) { return new Response('Template render error: ' + e.message, { status: 500 }); }

  const out = doc.getZip().generate({ type: 'nodebuffer' });

  // そのまま DOCX 返却（CloudConvert 等の外部PDF化は任意で組み込んでください）
  return new Response(out, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename=""filled.docx""'
    }
  });
}
