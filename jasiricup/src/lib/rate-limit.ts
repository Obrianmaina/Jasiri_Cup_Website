// src/lib/rate-limit.ts
/**
 * Simple in-process rate limiter.
 * For production on Vercel (multi-instance), swap the Map for a Redis/Upstash store.
 */

interface RateLimitStore {
  timestamps: number[];
  blocked?: boolean;
}

const store = new Map<string, RateLimitStore>();

// Periodic cleanup so the map doesn't grow forever
setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [key, val] of store.entries()) {
    val.timestamps = val.timestamps.filter(t => t > cutoff);
    if (val.timestamps.length === 0) store.delete(key);
  }
}, 5 * 60_000);

export interface RateLimitOptions {
  /** Window in milliseconds (default 60 s) */
  windowMs?: number;
  /** Max requests per window (default 10) */
  max?: number;
}

export function rateLimit(
  key: string,
  { windowMs = 60_000, max = 10 }: RateLimitOptions = {}
): { success: boolean; remaining: number; resetAt: number } {
  const now   = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  // Prune old timestamps
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);

  const remaining = Math.max(0, max - entry.timestamps.length);
  const resetAt   = entry.timestamps.length > 0 ? entry.timestamps[0] + windowMs : now + windowMs;

  if (entry.timestamps.length >= max) {
    store.set(key, entry);
    return { success: false, remaining: 0, resetAt };
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  return { success: true, remaining: remaining - 1, resetAt };
}