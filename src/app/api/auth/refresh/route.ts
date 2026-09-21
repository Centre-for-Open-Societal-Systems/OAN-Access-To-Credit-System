import { AUTH_MESSAGES } from '@/lib/authMessages';
import { getClientIp } from '@/lib/clientIp';
import { checkCsrf } from '@/lib/csrf';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { checkRateLimit, rateLimitedResponse } from '@/lib/rateLimit';
import { RATE_LIMITS } from '@/lib/securityConfig';
import {
    clearSessionCookies,
    isIdleExpired,
    readRememberMe,
    REFRESH_TOKEN_COOKIE,
    setSessionCookies,
} from '@/lib/session';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/** Ends the session in the browser and tells the client to sign in again. */
function endSession(message: string, status = 401): NextResponse {
  const response = NextResponse.json({ message }, { status });
  clearSessionCookies(response);
  return response;
}

export async function POST(request: NextRequest) {
  try {
    // CSRF: this endpoint mints a fresh access token from a cookie the browser
    // sends automatically, so without an origin check any site could keep a
    // session warm — or force a token rotation that logs the real tab out.
    const csrfError = checkCsrf(request);
    if (csrfError) return csrfError;

    const clientIp = getClientIp(request);
    const limit = checkRateLimit(
      `refresh:${clientIp}`,
      RATE_LIMITS.refresh.limit,
      RATE_LIMITS.refresh.windowMs
    );
    if (!limit.allowed) {
      logger.security(`Refresh rate limit exceeded for ${clientIp}`);
      return rateLimitedResponse(limit.retryAfterSeconds);
    }

    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      return endSession(AUTH_MESSAGES.sessionExpired);
    }

    // An idle session must not be revivable. `fetchApi` retries any 401 by
    // calling this route, so without this check a background poll firing after
    // the idle window would hand back a fresh token and quietly undo the
    // timeout on an unattended screen.
    if (isIdleExpired(request)) {
      logger.security('Refresh refused: session exceeded the idle timeout');
      return endSession(AUTH_MESSAGES.sessionExpired);
    }

    // Call external API to refresh the JWT
    const response = await fetch(`${env.API_BASE_URL}/v1/auth/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Forwarded-For': clientIp,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Logged, not returned: the backend distinguishes "expired", "revoked" and
      // "unknown token", and relaying that tells a caller holding a stolen token
      // which of those it is holding.
      logger.security(
        `Token refresh failed on backend, status ${response.status}:`,
        typeof data?.message === 'string' ? data.message : JSON.stringify(data)
      );
      return endSession(AUTH_MESSAGES.sessionExpired);
    }

    const token = data?.data?.token as string | undefined;
    const newRefreshToken = data?.data?.refresh_token as string | undefined;

    if (!token || !newRefreshToken) {
      logger.error('Invalid token payload returned from refresh API');
      return endSession(AUTH_MESSAGES.sessionExpired);
    }

    const nextResponse = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
    });

    // Reissue on the *original* session's terms. The remember-me choice is read
    // back from its own cookie rather than assumed: previously this route always
    // applied the 30-day lifetime, so the first refresh silently promoted a
    // 24-hour session into a month-long one. The backend does the same on its
    // side — it stores `remember_me` on the token row and honours it on rotation.
    setSessionCookies(nextResponse, {
      token,
      refreshToken: newRefreshToken,
      rememberMe: readRememberMe(request),
    });

    return nextResponse;
  } catch (error) {
    logger.error('Refresh Proxy Error:', error);
    return NextResponse.json({ message: AUTH_MESSAGES.sessionExpired }, { status: 500 });
  }
}
