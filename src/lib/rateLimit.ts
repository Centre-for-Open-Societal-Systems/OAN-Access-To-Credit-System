import { NextRequest, NextResponse } from 'next/server';

interface RateLimitInfo {
  tokens: number;
  lastRefill: number;
}

// In-memory store for rate limiting. Note: This state is isolated per Next.js
// worker process and is not shared across multi-instance deployments.
const store = new Map<string, RateLimitInfo>();

export function createRateLimiter(limit: number, windowMs: number) {
  return function rateLimit(request: NextRequest | Request): NextResponse | null {
    // Determine client IP. In Next.js App Router API routes, we can inspect headers
    const ip = 
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
      request.headers.get('x-real-ip') || 
      'unknown';

    // The token bucket key
    const now = Date.now();
    const info = store.get(ip);

    if (!info) {
      // First request from this IP
      store.set(ip, { tokens: limit - 1, lastRefill: now });
      return null;
    }

    // Refill tokens based on time elapsed
    const timePassed = now - info.lastRefill;
    const refillTokens = Math.floor((timePassed / windowMs) * limit);

    if (refillTokens > 0) {
      info.tokens = Math.min(limit, info.tokens + refillTokens);
      info.lastRefill = now;
    }

    if (info.tokens <= 0) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    info.tokens -= 1;
    return null;
  };
}
