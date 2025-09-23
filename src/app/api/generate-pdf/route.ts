import { Buffer } from 'node:buffer';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type DocumentType = 'resume' | 'job' | 'cv';
type NormalizedDocumentType = 'resume' | 'job';

type PersonalSection = {
  fullName?: string;
  furigana?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  email?: string;
};

type SummarySection = {
  summary?: string;
};

type ResumeSection = {
  selfPr?: string;
};

type JobSection = {
  document?: string;
  experience?: SummarySection;
  profile?: SummarySection;
};

type PhotoSection = {
  base64?: string;
  preview?: string;
  warning?: string;
};

type CollectedFormData = {
  personal?: PersonalSection;
  resume?: ResumeSection;
  job?: JobSection;
  photo?: PhotoSection;
};

type GeneratePdfPayload = {
  formData?: CollectedFormData;
  documentType?: DocumentType | string;
};

const DEFAULT_LINE_WIDTH = 36;

function normalizeDocumentType(documentType: string): NormalizedDocumentType | null {
  if (documentType === 'resume') {
    return 'resume';
  }
  if (documentType === 'job' || documentType === 'cv') {
    return 'job';
  }
  return null;
}

function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapText(text: string, width = DEFAULT_LINE_WIDTH): string[] {
  const trimmed = text ?? '';
  if (trimmed.length === 0) {
    return [''];
  }
  const characters = Array.from(trimmed);
  const lines: string[] = [];
  for (let index = 0; index < characters.length; index += width) {
    lines.push(characters.slice(index, index + width).join(''));
  }
  return lines;
}

function collapseEmptyLines(lines: string[]): string[] {
  const result: string[] = [];
  for (const line of lines) {
    const lastLine = result.length > 0 ? result[result.length - 1] : undefined;
    if (line.trim() === '' && lastLine?.trim() === '') {
      continue;
    }
    result.push(line);
  }
  return result;
}

function createContentLines(data: CollectedFormData, type: NormalizedDocumentType): string[] {
  const lines: string[] = [];
  const now = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Tokyo',
  }).format(new Date());
  lines.push(...wrapText(`生成日時: ${now}`, 40));

  const personal = data.personal ?? {};
  const personalEntries: string[] = [];
  if (personal.fullName) {
    personalEntries.push(`氏名: ${personal.fullName}`);
  }
  if (personal.furigana) {
    personalEntries.push(`ふりがな: ${personal.furigana}`);
  }
  if (personal.birthDate) {
    personalEntries.push(`生年月日: ${personal.birthDate}`);
  }
  if (personal.address) {
    personalEntries.push(`住所: ${personal.address}`);
  }
  if (personal.phone) {
    personalEntries.push(`電話番号: ${personal.phone}`);
  }
  if (personal.email) {
    personalEntries.push(`メールアドレス: ${personal.email}`);
  }
  if (personalEntries.length > 0) {
    lines.push('');
    personalEntries.forEach((entry) => {
      lines.push(...wrapText(entry, 40));
    });
  }

  if (type === 'resume') {
    lines.push('');
    lines.push('自己PR');
    const selfPr = data.resume?.selfPr?.trim();
    if (selfPr) {
      lines.push(...wrapText(selfPr));
    } else {
      lines.push('（未入力）');
    }
  } else {
    lines.push('');
    lines.push('職務経歴書（生成結果）');
    const jobDocument = data.job?.document?.trim();
    if (jobDocument) {
      lines.push(...wrapText(jobDocument));
    } else {
      const experienceSummary = data.job?.experience?.summary?.trim();
      const profileSummary = data.job?.profile?.summary?.trim();
      if (experienceSummary) {
        lines.push('');
        lines.push('職務経験要約');
        lines.push(...wrapText(experienceSummary));
      }
      if (profileSummary) {
        lines.push('');
        lines.push('求職者プロフィール要約');
        lines.push(...wrapText(profileSummary));
      }
      if (!experienceSummary && !profileSummary) {
        lines.push('（未入力）');
      }
    }
  }

  return collapseEmptyLines(lines);
}

function buildPdfBase64(title: string, lines: string[]): string {
  const sanitizedLines = collapseEmptyLines(lines);
  const textOps: string[] = ['BT', '/F1 24 Tf', '72 800 Td', `(${escapePdfText(title)}) Tj`];
  if (sanitizedLines.length > 0) {
    textOps.push('/F1 12 Tf');
    textOps.push('0 -32 Td');
    sanitizedLines.forEach((line, index) => {
      const content = line.trim() === '' ? ' ' : line;
      textOps.push(`(${escapePdfText(content)}) Tj`);
      if (index < sanitizedLines.length - 1) {
        textOps.push('0 -18 Td');
      }
    });
  }
  textOps.push('ET');
  const stream = textOps.join('\n');
  const streamBuffer = Buffer.from(stream, 'utf8');

  const header = '%PDF-1.4\n';
  let body = '';
  const offsets: number[] = [];

  const appendObject = (content: string) => {
    const offset = header.length + Buffer.byteLength(body, 'utf8');
    offsets.push(offset);
    body += content;
  };

  appendObject('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  appendObject('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  appendObject(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n'
  );
  appendObject(`4 0 obj\n<< /Length ${streamBuffer.length} >>\nstream\n${stream}\nendstream\nendobj\n`);
  appendObject('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  const xrefOffset = header.length + Buffer.byteLength(body, 'utf8');
  let xref = `xref\n0 ${offsets.length + 1}\n`;
  xref += '0000000000 65535 f \n';
  offsets.forEach((offset) => {
    xref += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });
  const trailer = `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const pdfContent = header + body + xref + trailer;
  return Buffer.from(pdfContent, 'utf8').toString('base64');
}

export async function POST(request: Request) {
  let payload: GeneratePdfPayload;
  try {
    payload = (await request.json()) as GeneratePdfPayload;
  } catch (error) {
    console.error('generate-pdf parse error', error);
    return NextResponse.json({ error: 'JSONの解析に失敗しました。' }, { status: 400 });
  }

  const { formData, documentType } = payload ?? {};
  if (!documentType || typeof documentType !== 'string') {
    return NextResponse.json({ error: 'documentType が不正です。' }, { status: 400 });
  }

  const normalizedType = normalizeDocumentType(documentType);
  if (!normalizedType) {
    return NextResponse.json({ error: 'documentType が不正です。' }, { status: 400 });
  }

  const data: CollectedFormData = formData && typeof formData === 'object' ? formData : {};

  try {
    const contentLines = createContentLines(data, normalizedType);
    const title = normalizedType === 'job' ? 'AI-ROBI 職務経歴書' : 'AI-ROBI 履歴書';
    const base64 = buildPdfBase64(title, contentLines);
    return NextResponse.json({ base64 });
  } catch (error) {
    console.error('generate-pdf build error', error);
    return NextResponse.json({ error: 'PDFの生成に失敗しました。' }, { status: 500 });
  }
}
