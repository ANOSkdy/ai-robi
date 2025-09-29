export const runtime = 'nodejs';
import { Document, Page, Text, pdf, StyleSheet } from '@react-pdf/renderer';
import { registerFontsJP } from '@/lib/pdf/fonts';
import { Buffer } from 'node:buffer';

const mm = (v:number)=> (v * 72) / 25.4;
const styles = StyleSheet.create({
  page: { padding: mm(12), fontFamily: 'NotoSansJP', fontSize: 11 }
});

export async function POST() {
  registerFontsJP();
  const Doc = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text>AI-ROBI 履歴書プレビュー（雛形）</Text>
      </Page>
    </Document>
  );
  const out = await pdf(<Doc />).toBuffer();
  const buf = Buffer.from(out as any);
  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="resume.pdf"'
    }
  });
}
