import { headers } from "next/headers";

const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX = 100; // requests per window
const TRACTION_MAX_PER_MIN = 10; // stricter for heartbeat endpoint

// In-memory rate limit (use Redis in production for multi-instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(): string {
  const headersList = headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "127.0.0.1"
  );
}

function rateLimitWithMax(identifier: string, maxPerWindow: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW * 1000;
  const record = rateLimitMap.get(identifier);

  if (!record) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW * 1000,
    });
    return { allowed: true, remaining: maxPerWindow - 1 };
  }

  if (record.resetAt < now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW * 1000,
    });
    return { allowed: true, remaining: maxPerWindow - 1 };
  }

  record.count++;
  const allowed = record.count <= maxPerWindow;
  return {
    allowed,
    remaining: Math.max(0, maxPerWindow - record.count),
  };
}

export function rateLimit(identifier: string): { allowed: boolean; remaining: number } {
  return rateLimitWithMax(identifier, RATE_LIMIT_MAX);
}

/** Stricter limit for traction heartbeat (per IP). */
export function rateLimitTraction(ip: string): { allowed: boolean } {
  const { allowed } = rateLimitWithMax(`traction:${ip}`, TRACTION_MAX_PER_MIN);
  return { allowed };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetAt < now) rateLimitMap.delete(key);
  }
}, 60000);
