export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { renderResumePdf } from '@/components/pdf/ResumePdfTemplate';
import { renderCvPdf } from '@/components/pdf/CvPdfTemplate';
import type { ResumeFormData } from '@/lib/schema';

async function launchBrowser() {
  // Vercel（無頭Chrome）とローカル（普通のpuppeteer）を自動判定
  if (process.env.VERCEL) {
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteer = await import('puppeteer-core');
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    const puppeteer = await import('puppeteer');
    return puppeteer.launch({ headless: true });
  }
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'リクエストの解析に失敗しました';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { formData, documentType } = (payload ?? {}) as { formData?: ResumeFormData; documentType?: 'resume' | 'cv' };
  if (!formData) return NextResponse.json({ error: 'formData が未指定' }, { status: 400 });
  if (documentType !== 'resume' && documentType !== 'cv') {
    return NextResponse.json({ error: 'documentType が不正' }, { status: 400 });
  }

  try {
    const html = documentType === 'resume'
      ? renderResumePdf(formData)
      : renderCvPdf(formData);

    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
    await page.close();
    await browser.close();

    const base64Pdf = Buffer.from(pdfBuffer).toString('base64');
    return NextResponse.json({ pdfBase64: base64Pdf });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'PDF生成エラー';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

