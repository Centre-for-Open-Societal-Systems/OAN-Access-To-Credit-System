import { AUTH_MESSAGES } from '@/lib/authMessages';
import { getClientIp } from '@/lib/clientIp';
import { checkCsrf } from '@/lib/csrf';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { checkRateLimit, rateLimitedResponse } from '@/lib/rateLimit';
import { RATE_LIMITS } from '@/lib/securityConfig';
import { setSessionCookies } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // CSRF: reject cross-origin login attempts.
    const csrfError = checkCsrf(request);
    if (csrfError) return csrfError;

    // Limits live in src/config/security.json and mirror the backend's own
    // per-IP login limit, so abuse stops at this hop without the two layers
    // disagreeing about the threshold.
    const clientIp = getClientIp(request);
    const limit = checkRateLimit(
      `login:${clientIp}`,
      RATE_LIMITS.login.limit,
      RATE_LIMITS.login.windowMs
    );
    if (!limit.allowed) {
      logger.security(`Login rate limit exceeded for ${clientIp}`);
      return rateLimitedResponse(limit.retryAfterSeconds);
    }

    const body = await request.json();
    const usr = body?.usr;
    const pwd = body?.pwd;
    const rememberMe = body?.rememberMe === true;

    if (!usr || !pwd) {
      return NextResponse.json({ message: 'Missing credentials in request' }, { status: 400 });
    }

    // Call external API using a clean slate (like Postman).
    //
    // X-Forwarded-For carries the *derived* client IP rather than the header the
    // caller sent. Frappe reads the leftmost entry into `frappe.local.request_ip`,
    // which keys its own login rate limit and attempt tracker — without this the
    // bench would see this container's address for every sign-in on the platform
    // and throttle everyone as one bucket.
    const response = await fetch(`${env.API_BASE_URL}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Forwarded-For': clientIp,
      },
      body: JSON.stringify({ usr, pwd, remember_me: rememberMe }),
    });

    const data = await response.json().catch(() => ({}));

    // The credentials were correct, but the password is an admin-issued temporary
    // one that must be rotated first. The backend deliberately issued no token, so
    // there is nothing to set as a cookie — forward the code and the login id the
    // caller typed so the client can show the set-password step instead of an error.
    if (data?.code === 'PASSWORD_CHANGE_REQUIRED') {
      return NextResponse.json(
        {
          code: 'PASSWORD_CHANGE_REQUIRED',
          usr,
          message: 'You must set your own password before signing in.',
        },
        { status: 403 }
      );
    }

    if (!response.ok) {
      // The backend's reason is logged, never returned. Relaying it verbatim is
      // what turns a login form into an enumeration oracle (and, on a 500, into
      // a stack-trace viewer). See lib/authMessages.ts.
      logger.security(
        `Login rejected for ${clientIp} with status ${response.status}:`,
        typeof data?.message === 'string' ? data.message : JSON.stringify(data)
      );

      const status = response.status >= 500 ? 502 : 401;
      const message =
        response.status === 429
          ? AUTH_MESSAGES.tooManyAttempts
          : response.status >= 500
            ? AUTH_MESSAGES.signInUnavailable
            : AUTH_MESSAGES.invalidCredentials;

      return NextResponse.json({ message }, { status: response.status === 429 ? 429 : status });
    }

    // Extract the JWT token, refresh token, and user strictly based on the REST envelope
    const token = data?.data?.token as string | undefined;
    const refreshToken = data?.data?.refresh_token as string | undefined;
    const user = data?.data?.user ?? null;

    const nextResponse = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user,
    });

    // Records the remember-me choice alongside the tokens so /api/auth/refresh
    // can reapply the same lifetime instead of silently promoting a one-day
    // session to a thirty-day one.
    setSessionCookies(nextResponse, { token, refreshToken, rememberMe });

    return nextResponse;
  } catch (error) {
    logger.error('Login Proxy Error:', error);
    return NextResponse.json({ message: AUTH_MESSAGES.signInUnavailable }, { status: 500 });
  }
}
