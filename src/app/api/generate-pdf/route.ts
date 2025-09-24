import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts } from 'pdf-lib';

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

type HistoryEntry = {
  year?: string;
  month?: string;
  description?: string;
  status?: string;
  type?: string;
};

type CollectedFormData = {
  personal?: PersonalSection;
  history?: HistoryEntry[];
  histories?: HistoryEntry[];
  qualifications?: HistoryEntry[];
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

function wrapText(text: string, width = DEFAULT_LINE_WIDTH): string[] {
  const trimmed = text ?? '';
  if (!trimmed) {
    return [];
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
    const previous = result[result.length - 1];
    if (line.trim() === '' && (!previous || previous.trim() === '')) {
      continue;
    }
    result.push(line);
  }
  return result;
}

function formatHistoryEntry(entry: HistoryEntry): string {
  const pieces: string[] = [];
  if (entry.year) {
    pieces.push(`${entry.year}年`);
  }
  if (entry.month) {
    pieces.push(`${entry.month}月`);
  }
  if (entry.status) {
    pieces.push(`【${entry.status}】`);
  }
  if (entry.description) {
    pieces.push(entry.description);
  }
  return pieces.join(' ').trim();
}

function collectHistoryEntries(data: CollectedFormData): HistoryEntry[] {
  if (Array.isArray(data.histories) && data.histories.length > 0) {
    return data.histories;
  }
  const combined: HistoryEntry[] = [];
  if (Array.isArray(data.history)) {
    combined.push(...data.history);
  }
  if (Array.isArray(data.qualifications)) {
    combined.push(...data.qualifications);
  }
  return combined;
}

function createContentLines(data: CollectedFormData, type: NormalizedDocumentType): string[] {
  const lines: string[] = [];
  const now = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Tokyo',
  }).format(new Date());
  lines.push(`生成日時: ${now}`);

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

  const historyEntries = collectHistoryEntries(data);
  if (historyEntries.length > 0) {
    lines.push('');
    lines.push('学歴・職歴 / 免許・資格');
    historyEntries.forEach((entry) => {
      const formatted = formatHistoryEntry(entry);
      if (formatted) {
        lines.push(...wrapText(formatted, 40));
      }
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

  if (data.photo?.warning) {
    lines.push('');
    lines.push('写真に関する注意');
    lines.push(...wrapText(data.photo.warning));
  }

  return collapseEmptyLines(lines);
}

async function buildPdfBase64(title: string, lines: string[]): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 12;
  const lineHeight = fontSize * 1.5;
  const margin = 48;
  let page = pdfDoc.addPage([595, 842]);
  let cursorY = page.getHeight() - margin;

  const drawLine = (text: string, font = regularFont, size = fontSize) => {
    if (cursorY <= margin) {
      page = pdfDoc.addPage([595, 842]);
      cursorY = page.getHeight() - margin;
    }
    page.drawText(text, {
      x: margin,
      y: cursorY,
      size,
      font,
    });
    cursorY -= lineHeight;
  };

  drawLine(title, boldFont, 24);
  cursorY -= lineHeight / 2;

  collapseEmptyLines(lines).forEach((line) => {
    drawLine(line.trim() === '' ? ' ' : line);
  });

  return pdfDoc.saveAsBase64({ dataUri: false });
}

export async function POST(request: Request) {
  let payload: GeneratePdfPayload;
  try {
    payload = (await request.json()) as GeneratePdfPayload;
  } catch (error) {
    console.error('generate-pdf: failed to parse request body', error);
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const { formData = {}, documentType = '' } = payload ?? {};
  const normalizedType =
    typeof documentType === 'string' ? normalizeDocumentType(documentType) : null;
  if (!normalizedType) {
    return NextResponse.json(
      { error: 'Invalid document type. Use "resume" or "job".' },
      { status: 400 }
    );
  }

  try {
    const lines = createContentLines(formData, normalizedType);
    const title = normalizedType === 'resume' ? 'AI-ROBI 履歴書' : 'AI-ROBI 職務経歴書';
    const base64 = await buildPdfBase64(title, lines);
    return NextResponse.json({ base64 });
  } catch (error) {
    console.error('generate-pdf: failed to build document', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF. Please try again later.' },
      { status: 500 }
    );
  }
}
