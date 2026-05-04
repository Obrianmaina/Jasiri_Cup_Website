// src/lib/rate-limit.ts
/**
 * Production-safe rate limiter.
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set,
 * falls back to in-memory for local dev (NOT suitable for multi-instance production).
 *
 * To enable Redis: add to .env.local:
 *   UPSTASH_REDIS_REST_URL=https://...
 *   UPSTASH_REDIS_REST_TOKEN=...
 * Get free tier at https://console.upstash.com
 */

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimitOptions {
  windowMs?: number; // Window in ms (default 60s)
  max?: number;      // Max requests per window (default 10)
}

// ─── In-memory fallback (dev only) ────────────────────────────────────────────
const memStore = new Map<string, number[]>();

setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [key, timestamps] of memStore.entries()) {
    const fresh = timestamps.filter(t => t > cutoff);
    if (fresh.length === 0) memStore.delete(key);
    else memStore.set(key, fresh);
  }
}, 5 * 60_000);

function rateLimitMemory(
  key: string,
  windowMs: number,
  max: number,
): RateLimitResult {
  const now = Date.now();
  const entry = memStore.get(key) ?? [];
  const fresh = entry.filter(t => now - t < windowMs);
  const remaining = Math.max(0, max - fresh.length);
  const resetAt = fresh.length > 0 ? fresh[0] + windowMs : now + windowMs;

  if (fresh.length >= max) {
    memStore.set(key, fresh);
    return { success: false, remaining: 0, resetAt };
  }

  fresh.push(now);
  memStore.set(key, fresh);
  return { success: true, remaining: remaining - 1, resetAt };
}

// ─── Upstash Redis (production) ───────────────────────────────────────────────
async function rateLimitRedis(
  key: string,
  windowMs: number,
  max: number,
): Promise<RateLimitResult> {
  const url   = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const now   = Date.now();
  const windowSec = Math.ceil(windowMs / 1000);
  const redisKey  = `rl:${key}`;

  // MULTI/EXEC equivalent: INCR + EXPIRE
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', redisKey],
      ['EXPIRE', redisKey, windowSec],
    ]),
  });

  if (!res.ok) {
    // Redis unavailable - allow the request to avoid false-blocking
    console.warn('Rate-limit Redis unavailable, allowing request');
    return { success: true, remaining: max - 1, resetAt: now + windowMs };
  }

  const data = (await res.json()) as [{ result: number }, { result: number }];
  const count = data[0].result;
  const remaining = Math.max(0, max - count);

  if (count > max) {
    return { success: false, remaining: 0, resetAt: now + windowMs };
  }

  return { success: true, remaining, resetAt: now + windowMs };
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function rateLimit(
  key: string,
  options: RateLimitOptions = {},
): Promise<RateLimitResult> {
  const { windowMs = 60_000, max = 10 } = options;

  const hasRedis =
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN;

  if (hasRedis) {
    return rateLimitRedis(key, windowMs, max);
  }

  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[rate-limit] No Redis configured in production. ' +
      'Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for multi-instance safety.',
    );
  }

  return rateLimitMemory(key, windowMs, max);
}

// Convenience wrappers
export const rateLimitContact = (ip: string) =>
  rateLimit(`contact:${ip}`, { windowMs: 60_000, max: 3 });

export const rateLimitOrder = (ip: string) =>
  rateLimit(`order:${ip}`, { windowMs: 60_000, max: 5 });