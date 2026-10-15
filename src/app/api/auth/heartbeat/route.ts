import { getClientIp } from '@/lib/clientIp';
import { readAppIamSession } from '@/lib/activeSession';
import { checkCsrf } from '@/lib/csrf';
import { checkRateLimit, rateLimitedResponse } from '@/lib/rateLimit';
import { RATE_LIMITS } from '@/lib/securityConfig';
import { AUTH_TOKEN_COOKIE, isIdleExpired, touchActivityCookie } from '@/lib/session';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Restarts the idle timer.
 *
 * Called by the client idle watcher when someone actually interacts with the
 * page — throttled to at most once per `activityPingMinIntervalSeconds`. This is
 * deliberately the *only* API route that touches the activity cookie (page
 * navigations in the middleware being the other trigger): if ordinary
 * `/api/proxy` traffic refreshed it, background polling would keep an
 * unattended screen signed in indefinitely, which is precisely what the idle
 * timeout exists to prevent.
 *
 * Never revives a session that has already gone past the timeout — that is the
 * difference between "still here" and "back at the keyboard an hour later".
 */
export async function POST(request: NextRequest) {
  const csrfError = checkCsrf(request);
  if (csrfError) return csrfError;

  const limit = checkRateLimit(
    `heartbeat:${getClientIp(request)}`,
    RATE_LIMITS.heartbeat.limit,
    RATE_LIMITS.heartbeat.windowMs
  );
  if (!limit.allowed) {
    return rateLimitedResponse(limit.retryAfterSeconds);
  }

  // An SSO session has no idle clock here (Keycloak owns it): report it live,
  // touch nothing.
  if (!request.cookies.get(AUTH_TOKEN_COOKIE)?.value && readAppIamSession(request)) {
    return NextResponse.json({ active: true });
  }

  const hasSession = !!request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  if (!hasSession || isIdleExpired(request)) {
    return NextResponse.json({ active: false }, { status: 401 });
  }

  const response = NextResponse.json({ active: true });
  touchActivityCookie(response);
  return response;
}
