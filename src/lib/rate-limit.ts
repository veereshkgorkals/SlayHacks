export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const CLEANUP_INTERVAL_MS = 60_000;

const requestLog = new Map<string, number[]>();
let lastCleanupAt = Date.now();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "127.0.0.1";
}

function pruneExpiredEntries(now: number): void {
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
  lastCleanupAt = now;
  const cutoff = now - WINDOW_MS;
  for (const [ip, timestamps] of requestLog.entries()) {
    const active = timestamps.filter((ts) => ts > cutoff);
    if (active.length === 0) {
      requestLog.delete(ip);
    } else {
      requestLog.set(ip, active);
    }
  }
}

/**
 * Sliding-window IP rate limiter (10 requests per 60 seconds).
 */
export function rateLimit(req: Request): RateLimitResult {
  const now = Date.now();
  pruneExpiredEntries(now);

  const ip = getClientIp(req);
  const cutoff = now - WINDOW_MS;
  const timestamps = (requestLog.get(ip) ?? []).filter((ts) => ts > cutoff);

  if (timestamps.length >= MAX_REQUESTS) {
    const oldest = timestamps[0] ?? now;
    const resetInSeconds = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
    requestLog.set(ip, timestamps);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  timestamps.push(now);
  requestLog.set(ip, timestamps);

  const oldest = timestamps[0] ?? now;
  const resetInSeconds = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));

  return {
    allowed: true,
    remaining: Math.max(0, MAX_REQUESTS - timestamps.length),
    resetInSeconds,
  };
}
