import fs from 'node:fs/promises';
import path from 'node:path';

import chromium from '@sparticuz/chromium';
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import type { Browser, Page } from 'puppeteer-core';
import { z } from 'zod';

import { renderTemplate } from '@/lib/render-template';

export const runtime = 'nodejs';

const MAX_BODY_SIZE = 1.5 * 1024 * 1024;

const BodySchema = z.object({
  formData: z.record(z.unknown()),
  documentType: z.enum(['resume', 'cv']),
});

type DocumentType = z.infer<typeof BodySchema>['documentType'];
function buildFilename(documentType: DocumentType) {
  return documentType === 'resume' ? '履歴書.pdf' : '職務経歴書.pdf';
}

async function launchBrowser() {
  const executablePath = process.env.VERCEL
    ? await chromium.executablePath()
    : process.env.CHROME_EXECUTABLE_PATH ?? (await chromium.executablePath());

  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: executablePath || undefined,
    headless: true,
  });
}

async function setupFontInterception(page: Page) {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Regular.ttf');
  try {
    const fontData = await fs.readFile(fontPath);
    await page.setRequestInterception(true);
    page.on('request', async (request) => {
      if (new URL(request.url()).pathname === '/fonts/NotoSansJP-Regular.ttf') {
        await request.respond({
          status: 200,
          contentType: 'font/ttf',
          body: fontData,
        });
        return;
      }
      request.continue();
    });
  } catch (error) {
    console.warn('pdf: failed to intercept font', error);
  }
}

export const POST = async (request: NextRequest) => {
  let browser: Browser | null = null;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'リクエストが大きすぎます。' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch (error) {
      console.error('pdf: invalid json', error);
      return NextResponse.json(
        { error: 'リクエスト形式が正しくありません。' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const parsed = BodySchema.safeParse(payload);
    if (!parsed.success) {
      console.error('pdf: validation error', parsed.error);
      return NextResponse.json(
        { error: '入力内容に不備があります。' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const { formData, documentType } = parsed.data;
    const html = await renderTemplate(documentType, formData);

    browser = await launchBrowser();
    const page = await browser.newPage();
    await setupFontInterception(page);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', right: '16mm', bottom: '16mm', left: '16mm' },
    });

    const filename = buildFilename(documentType);
    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('pdf: failed to generate', error);
    return NextResponse.json(
      { error: 'PDFの生成に失敗しました。' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
