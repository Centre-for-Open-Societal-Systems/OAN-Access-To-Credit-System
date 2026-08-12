import { checkCsrf } from '@/lib/csrf';
import { env } from '@/lib/env';
import { createRateLimiter } from '@/lib/rateLimit';
import { NextRequest, NextResponse } from 'next/server';

const logoutLimiter = createRateLimiter(3, 60000);

export async function POST(request: NextRequest) {
  const rateLimitResponse = logoutLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  const csrfError = checkCsrf(request);
  if (csrfError) return csrfError;

  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (refreshToken) {
    // Best-effort backend revocation call
    await fetch(`${env.API_BASE_URL}/api/method/oan_a2c.api.auth.logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => {
      // Swallow error, cookies are cleared regardless
    });
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  // Clear the auth cookies by setting them to expire in the past. Both are
  // cleared so a lingering refresh_token can't re-mint a session.
  const expired = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 0,
  };
  response.cookies.set('auth_token', '', expired);
  response.cookies.set('refresh_token', '', expired);
  response.cookies.set('session_type', '', expired);

  return response;
}
