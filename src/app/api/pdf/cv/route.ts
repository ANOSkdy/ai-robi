export const runtime = 'nodejs';
import { Document, Page, Text, pdf, StyleSheet } from '@react-pdf/renderer';
import { registerFontsJP } from '@/lib/pdf/fonts';

const mm = (v:number)=> (v * 72) / 25.4;
const styles = StyleSheet.create({
  page: { padding: mm(12), fontFamily: 'NotoSansJP', fontSize: 11 }
});

export async function POST() {
  registerFontsJP();
  const Doc = () => (
    <Document>
      <Page size='A4' style={styles.page}>
        <Text>AI-ROBI 職務経歴書プレビュー（雛形）</Text>
      </Page>
    </Document>
  );
  const blob = await pdf(<Doc />).toBuffer();
  return new Response(blob, {
    status: 200,
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="cv.pdf"' }
  });
}
