import { checkCsrf } from '@/lib/csrf';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { createRateLimiter } from '@/lib/rateLimit';
import { NextRequest, NextResponse } from 'next/server';

const loginLimiter = createRateLimiter(10, 60000);

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = loginLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // CSRF: reject cross-origin login attempts.
    const csrfError = checkCsrf(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const usr = body?.usr;
    const pwd = body?.pwd;
    const rememberMe = body?.rememberMe ?? false;

    if (!usr || !pwd) {
      return NextResponse.json({ message: 'Missing credentials in request' }, { status: 400 });
    }

    // Call external API using a clean slate (like Postman)
    const response = await fetch(`${env.API_BASE_URL}/api/method/oan_a2c.api.auth.login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ usr, pwd, remember_me: rememberMe }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errorMessage = 'Invalid credentials. Please try again.';
      if (typeof data.message === 'string') {
        errorMessage = data.message;
      } else if (data.message && typeof data.message === 'object') {
        errorMessage = data.message.message || data.message.error || JSON.stringify(data.message);
      } else if (data.exc_type || data.exception) {
        errorMessage = data.exc_type || 'Authentication Error';
      }

      return NextResponse.json(
        { message: errorMessage },
        { status: response.status }
      );
    }

    // Extract the JWT token, refresh token, and user strictly based on the provided API response structure
    const token = data.message?.data?.token as string | undefined;
    const refreshToken = data.message?.data?.refresh_token as string | undefined;
    const user = data.message?.data?.user ?? null;

    const nextResponse = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    // Both cookies live for the session (refresh-token) lifetime. The access
    // token's own 15-min expiry is enforced separately (inside the JWT and by
    // the backend); the cookie is only the container. Keeping auth_token from
    // outliving the session means "auth_token present" reliably signals an
    // intended-alive session — which the routing layer relies on.
    const sessionMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days if rememberMe, 1 day if not

    if (token) {
      nextResponse.cookies.set('auth_token', token, {
        ...cookieOptions,
        maxAge: sessionMaxAge,
      });
    }

    if (refreshToken) {
      nextResponse.cookies.set('refresh_token', refreshToken, {
        ...cookieOptions,
        maxAge: sessionMaxAge,
      });
      nextResponse.cookies.set('session_type', rememberMe ? 'persistent' : 'session', {
        ...cookieOptions,
        maxAge: sessionMaxAge,
      });
    }

    return nextResponse;
  } catch (error) {
    logger.error('Login Proxy Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });

  }
}
