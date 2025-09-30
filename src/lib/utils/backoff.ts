export async function withBackoff<T>(fn: () => Promise<T>) {
  const delays = [500, 1000, 2000, 4000];
  let lastErr: unknown;
  for (let i = 0; i < delays.length; i++) {
    try { return await fn(); } catch (e) {
      lastErr = e; if (i < delays.length - 1) await new Promise(r => setTimeout(r, delays[i]));
    }
  }
  throw lastErr;
}
