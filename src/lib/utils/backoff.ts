export async function withBackoff<T>(fn: () => Promise<T>): Promise<T> {
  const maxAttempts = 5;
  const baseDelayMs = 500;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts - 1) {
        break;
      }
      const delay = baseDelayMs * 2 ** attempt;
      const jitter = Math.random() * baseDelayMs;
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delay + jitter);
      });
    }
  }

  throw lastError;
}
