export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (e) {
      attempt++;
      if (attempt >= retries) throw e;
      // Exponential backoff + basic random jitter
      const backoff = delayMs * Math.pow(2, attempt) + Math.random() * 200;
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
}
