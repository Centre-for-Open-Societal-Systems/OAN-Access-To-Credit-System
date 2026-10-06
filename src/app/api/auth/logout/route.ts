import { getClientIp } from '@/lib/clientIp';
import { checkCsrf } from '@/lib/csrf';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { checkRateLimit, rateLimitedResponse } from '@/lib/rateLimit';
import { RATE_LIMITS } from '@/lib/securityConfig';
import { clearSessionCookies, REFRESH_TOKEN_COOKIE } from '@/lib/session';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // CSRF: without this, any site could sign a person out mid-application. It is
  // a nuisance rather than a breach, but it is also one line.
  const csrfError = checkCsrf(request);
  if (csrfError) return csrfError;

  const clientIp = getClientIp(request);
  const limit = checkRateLimit(
    `logout:${clientIp}`,
    RATE_LIMITS.logout.limit,
    RATE_LIMITS.logout.windowMs
  );

  // A tripped limit must never leave someone signed in. What the limiter is
  // protecting is the backend revocation call below — clearing our own cookies
  // costs nothing and needs no upstream hop, so it happens either way.
  //
  // Returning 429 with the cookies intact (the obvious reading of "rate limited")
  // meant the browser was told logout succeeded, the cookies survived, and the
  // middleware sent the person straight back into the dashboard.
  if (!limit.allowed) {
    logger.security(
      `Logout rate limit exceeded for ${clientIp}; cookies cleared without revoking upstream`
    );
    const limited = rateLimitedResponse(limit.retryAfterSeconds);
    clearSessionCookies(limited);
    return limited;
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // Revoke the refresh token server-side before dropping the cookies.
  //
  // Clearing cookies alone leaves the token valid in `A2C User Refresh Token`
  // until it expires — so anyone who captured it (a shared device, a proxy log,
  // a backup) could still redeem it for a live session long after sign-out. The
  // backend endpoint deletes the row, which is what actually ends the session.
  if (refreshToken) {
    try {
      const response = await fetch(`${env.API_BASE_URL}/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Forwarded-For': clientIp,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!response.ok) {
        logger.security(`Refresh token revocation returned status ${response.status}`);
      }
    } catch (error) {
      // Best-effort: a bench that is down must not trap someone in a session
      // they asked to leave. The cookies are still cleared below, so the token
      // becomes unreachable from this browser either way.
      logger.error('Refresh token revocation failed:', error);
    }
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  clearSessionCookies(response);
  return response;
}
