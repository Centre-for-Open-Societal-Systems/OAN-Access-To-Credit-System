import { checkCsrf } from '@/lib/csrf';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { createRateLimiter } from '@/lib/rateLimit';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const refreshLimiter = createRateLimiter(30, 60000);

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = refreshLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const csrfError = checkCsrf(request);
    if (csrfError) return csrfError;

    const refreshToken = request.cookies.get('refresh_token')?.value;
    const sessionType = request.cookies.get('session_type')?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: 'Missing refresh token' }, { status: 401 });
    }

    // Call external API to refresh the JWT
    const response = await fetch(`${env.API_BASE_URL}/api/method/oan_a2c.api.auth.refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      logger.warn('Token refresh failed on backend, status:', response.status);
      let errorMessage = 'Refresh token has expired or is invalid.';
      if (typeof data.message === 'string') {
        errorMessage = data.message;
      } else if (data.message && typeof data.message === 'object') {
        errorMessage = data.message.message || data.message.error || JSON.stringify(data.message);
      }

      // Clear the cookies since the session is now invalid
      const nextResponse = NextResponse.json(
        { message: errorMessage },
        { status: 401 }
      );
      nextResponse.cookies.set('auth_token', '', { path: '/', maxAge: 0 });
      nextResponse.cookies.set('refresh_token', '', { path: '/', maxAge: 0 });
      nextResponse.cookies.set('session_type', '', { path: '/', maxAge: 0 });
      return nextResponse;
    }

    const token = data.message?.data?.token as string | undefined;
    const newRefreshToken = data.message?.data?.refresh_token as string | undefined;

    if (!token || !newRefreshToken) {
      logger.error('Invalid token payload returned from refresh API');
      return NextResponse.json({ message: 'Invalid token payload' }, { status: 500 });
    }

    const nextResponse = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    // Keep both cookies on the same (session) lifetime so auth_token never
    // outlives the refresh token — "auth_token present" must reliably signal an
    // intended-alive session for the routing layer. The 15-min access-token
    // expiry is enforced inside the JWT / by the backend, not by this cookie.
    const sessionMaxAge = sessionType === 'persistent' ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

    nextResponse.cookies.set('auth_token', token, {
      ...cookieOptions,
      maxAge: sessionMaxAge,
    });

    nextResponse.cookies.set('refresh_token', newRefreshToken, {
      ...cookieOptions,
      maxAge: sessionMaxAge,
    });

    nextResponse.cookies.set('session_type', sessionType ?? 'session', {
      ...cookieOptions,
      maxAge: sessionMaxAge,
    });

    return nextResponse;
  } catch (error) {
    logger.error('Refresh Proxy Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
