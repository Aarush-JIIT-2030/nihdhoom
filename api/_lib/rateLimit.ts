type Bucket = { count: number; resetAt: number };

const buckets: Map<string, Bucket> = (globalThis as typeof globalThis & { __nirdhoomRateBuckets?: Map<string, Bucket> }).__nirdhoomRateBuckets
  ?? new Map<string, Bucket>();

(globalThis as typeof globalThis & { __nirdhoomRateBuckets?: Map<string, Bucket> }).__nirdhoomRateBuckets = buckets;

export function clientKey(req: any): string {
  const forwarded = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || String(req.headers?.['x-real-ip'] || 'unknown');
}

export function rateLimit(req: any, res: any, name: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const key = `${name}:${clientKey(req)}`;
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    res.setHeader?.('X-RateLimit-Limit', String(limit));
    res.setHeader?.('X-RateLimit-Remaining', String(Math.max(0, limit - 1)));
    return true;
  }
  if (current.count >= limit) {
    res.setHeader?.('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)));
    res.setHeader?.('X-RateLimit-Limit', String(limit));
    res.setHeader?.('X-RateLimit-Remaining', '0');
    return false;
  }
  current.count += 1;
  res.setHeader?.('X-RateLimit-Limit', String(limit));
  res.setHeader?.('X-RateLimit-Remaining', String(Math.max(0, limit - current.count)));
  return true;
}
