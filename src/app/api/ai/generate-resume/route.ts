export const runtime = 'nodejs';
import { zResumePRReq } from '@/lib/validate/zod';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = zResumePRReq.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  // P1ではAI未実装のためダミー返却
  return Response.json({ prText: '' });
}
