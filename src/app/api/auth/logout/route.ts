import { getClientIp } from '@/lib/clientIp';
import { checkCsrf } from '@/lib/csrf';
import { applyIamCookies, readIamSession, revokeIamSession } from '@/lib/iamSession';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { checkRateLimit, rateLimitedResponse } from '@/lib/rateLimit';
import { RATE_LIMITS } from '@/lib/securityConfig';
import { safeLoginPath } from '@/lib/ssoRedirect';
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
  // Clearing cookies alone leaves the token valid in `OAN User Refresh Token`
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

  // An SSO session is ended at IAM (it drops the refresh token it holds) and at
  // the identity provider: IAM hands back the provider's logout URL, which the
  // client navigates to — the provider's SSO session lives in the browser, so
  // only the browser can end it. The provider then returns the browser to
  // `returnTo`, this app's own login page. Best effort: `revokeIamSession` never
  // throws, and without a URL the client just lands locally.
  //
  // With no local session, any IAM session is ended, including one this app does
  // not accept (a user with no role here, say). That is what "Sign out and use a
  // different account" on the login page asks for; without it Keycloak would
  // sign the same account straight back in on every SSO attempt.
  const iam = refreshToken ? null : readIamSession(request);
  const body = (await request.json().catch(() => ({}))) as { returnTo?: unknown };
  const returnTo = safeLoginPath(body.returnTo) ?? '/login';
  const iamLogout = iam
    ? await revokeIamSession(iam, new URL(returnTo, request.url).toString(), clientIp)
    : null;

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
    redirectTo: iamLogout?.providerLogoutUrl ?? null,
  });
  clearSessionCookies(response);
  // IAM's own clearing headers carry the exact domain it set the cookies on.
  applyIamCookies(response, iamLogout?.setCookies ?? []);
  return response;
}
