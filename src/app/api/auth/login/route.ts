import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { checkCsrf } from '@/lib/csrf';

export async function POST(request: Request) {
  try {
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
      sameSite: 'lax' as const,
      path: '/',
    };

    if (token) {
      nextResponse.cookies.set('auth_token', token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60, // 7 days Max age for the cookie container (the backend token handles its own 15 min expiry)
      });
    }

    if (refreshToken) {
      const refreshMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days if rememberMe, 1 day if not
      nextResponse.cookies.set('refresh_token', refreshToken, {
        ...cookieOptions,
        maxAge: refreshMaxAge,
      });
    }

    return nextResponse;
  } catch (error) {
    logger.error('Login Proxy Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });

  }
}
