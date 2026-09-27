import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();

  /**
   * Cleans up expired rate limit entries every 5 minutes.
   */
  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (now > record.resetAt) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Checks rate limit for a key.
   * @param key Unique identifier (e.g. `ip:endpoint` or `user:endpoint`)
   * @param maxRequests Maximum requests allowed in window
   * @param windowMs Window in milliseconds
   */
  public check(key: string, maxRequests: number, windowMs: number): {
    allowed: boolean;
    remaining: number;
    resetInSeconds: number;
    resetInMs: number;
  } {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.resetAt) {
      this.store.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetInSeconds: Math.ceil(windowMs / 1000),
        resetInMs: windowMs,
      };
    }

    if (existing.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: Math.ceil((existing.resetAt - now) / 1000),
        resetInMs: Math.max(0, existing.resetAt - now),
      };
    }

    existing.count += 1;
    return {
      allowed: true,
      remaining: maxRequests - existing.count,
      resetInSeconds: Math.ceil((existing.resetAt - now) / 1000),
      resetInMs: Math.max(0, existing.resetAt - now),
    };
  }
}

export const rateLimiter = new InMemoryRateLimiter();
export const apiRateLimiter = rateLimiter;

/**
 * Extracts client IP from NextRequest.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
