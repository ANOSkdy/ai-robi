const TOKENS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const LIMIT = 3;

export async function rateLimit(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? 'anon').split(',')[0].trim();
  const now = Date.now();
  const arr = TOKENS.get(ip) ?? [];
  const recent = arr.filter(t => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) return false;
  recent.push(now);
  TOKENS.set(ip, recent);
  return true;
}
