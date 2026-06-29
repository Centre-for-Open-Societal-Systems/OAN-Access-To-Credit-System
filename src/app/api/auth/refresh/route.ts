import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;

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
      sameSite: 'lax' as const,
      path: '/',
    };

    nextResponse.cookies.set('auth_token', token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7 days Max age for the cookie container
    });

    nextResponse.cookies.set('refresh_token', newRefreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60, // 30 days max container age
    });

    return nextResponse;
  } catch (error) {
    logger.error('Refresh Proxy Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
