import { canAccess, homeRouteFor, isProtectedRoute, readIamRoutingSession, readRoutingSession } from '@/features/auth/rbac';
import { readAppIamSession } from '@/lib/activeSession';
import { canRefreshIamSession } from '@/lib/iamSession';
import {
    AUTH_TOKEN_COOKIE,
    clearAuthTokenCookie,
    clearSessionCookies,
    isIdleExpired,
    REFRESH_TOKEN_COOKIE,
    touchActivityCookie,
} from '@/lib/session';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Per-request nonce + CSP. The nonce is forwarded on the request headers so
  // Next can stamp it onto its own bootstrap/inline scripts; it is also set on
  // the response so the browser enforces it.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', csp);

  const withCsp = (response: NextResponse) => {
    response.headers.set('Content-Security-Policy', csp);
    return response;
  };

  const redirectToLogin = (reason?: string) => {
    const loginUrl = new URL('/login', request.url);
    if (reason) loginUrl.searchParams.set('reason', reason);
    return withCsp(NextResponse.redirect(loginUrl));
  };

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const localSession = readRoutingSession(token);
  const hasRefreshToken = !!request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // A Development Agent signs in through SSO: the session is the OpenG2P IAM
  // service's cookies, not ours (lib/iamSession.ts). A local session wins when a
  // browser somehow holds both — it is the one this app issued.
  const iam = localSession.state === 'none' && !hasRefreshToken ? readAppIamSession(request) : null;
  const session = iam ? readIamRoutingSession(iam.claims) : localSession;
  const canRenew = iam ? canRefreshIamSession(iam) : hasRefreshToken;

  // 0. Idle timeout. The activity cookie outlives its own max-age only while
  //    someone is actually using the app, so its absence alongside a session
  //    cookie means the screen has been unattended past the policy window.
  //    Handled before anything else so an idle session cannot be routed as live.
  if (session.state !== 'none' && isIdleExpired(request)) {
    const response = redirectToLogin('idle');
    clearSessionCookies(response);
    return response;
  }

  // 1. Authenticated routes.
  //
  //    `active` is the plain case. `expired` is accepted only while a refresh
  //    token is present: the access token is meant to expire every 15 minutes
  //    and be rotated by /api/auth/refresh, so bouncing on expiry alone would
  //    sign everyone out four times an hour. Once both are gone — after logout,
  //    or after a failed refresh clears them — the session is over.
  //
  //    This replaces a bare "is the cookie non-empty" test, which accepted any
  //    string at all as proof of a session.
  const isAuthenticated =
    session.state === 'active' || (session.state === 'expired' && canRenew);

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const response = redirectToLogin(hasRefreshToken ? 'session' : undefined);

    // A cookie that did not survive validation is not merely useless, it is
    // misleading — drop it rather than leave it to fail the same way next time.
    //
    // But drop only the broken one. `clearSessionCookies` here also destroyed a
    // perfectly good refresh token, turning a recoverable state (truncated or
    // stale access-token cookie, backend token-format change) into a full
    // re-login and orphaning the backend's refresh-token row. The refresh token
    // is opaque and backend-validated, so keeping it costs nothing and lets
    // `/api/auth/refresh` mint a new access token on the next API call.
    //
    // The request is still bounced rather than let through: a token that does
    // not decode carries no `user_type`, so role-based routing below has nothing
    // to enforce with, and rendering an authenticated shell without it would be
    // worse than asking for a sign-in.
    if (token) clearAuthTokenCookie(response);
    return response;
  }

  // 2. Role-based routing (routing/UX only — the backend authorizes every API
  //    call). Bounce role mismatches to where they belong.
  const kind = isAuthenticated ? session.kind : null;

  // Prevent signed-in visitors from sitting on any login page — send them to the
  // home route for their actual role, not a hardcoded one.
  if ((pathname === '/login' || pathname.startsWith('/login/')) && kind) {
    return withCsp(NextResponse.redirect(new URL(homeRouteFor(kind), request.url)));
  }

  // Block navigation to routes the role may not access.
  if (kind && !canAccess(kind, pathname)) {
    return withCsp(NextResponse.redirect(new URL(homeRouteFor(kind), request.url)));
  }

  const response = withCsp(NextResponse.next({ request: { headers: requestHeaders } }));

  // A page navigation is a person doing something, so it restarts the idle
  // timer. Background API polling deliberately does not — see the note on
  // SESSION_ACTIVITY_COOKIE in lib/session.ts.
  // An SSO session has no idle clock of ours: Keycloak owns its idle timeout.
  if (isAuthenticated && !iam) touchActivityCookie(response);

  return response;
}

// Builds the Content-Security-Policy for a request.
//
// In development Next.js's HMR / React Refresh requires 'unsafe-eval' and
// inline scripts, so the policy is relaxed.
//
// In production we drop both 'unsafe-eval' and 'unsafe-inline' and use a
// per-request nonce plus 'strict-dynamic'. Next still emits inline scripts on
// every request (the streamed RSC payload via self.__next_f and the hydration
// runtime) — these are unavoidable framework output, not ours. We can't use
// 'unsafe-inline' (that would also allow attacker-injected scripts) and we
// can't hash them (the content changes per request), so the nonce is what lets
// Next's own inline + chunk scripts run while injected scripts are blocked.
// The nonce is propagated to Next via the request header above; pages must be
// dynamically rendered for it to be applied (see `dynamic` in app/layout.tsx).
//
// Third-party libraries that inject their own unnonced <style> tags at
// runtime (e.g. sonner's toast layer) won't get a pass here — import their
// static stylesheet instead (see `sonner/dist/styles.css` in app/layout.tsx)
// rather than loosening this policy.
function buildCsp(nonce: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  const apiBaseUrl = process.env.API_BASE_URL ?? '';

  const scriptSrc = isProd
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : "script-src 'self' 'unsafe-eval' 'unsafe-inline'";

  const styleSrc = isProd
    ? `style-src 'self' 'nonce-${nonce}'`
    : "style-src 'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    scriptSrc,
    styleSrc,
    "object-src 'none'",
    "img-src 'self' data: blob:",
    `connect-src 'self' ${apiBaseUrl}`.trim(),
    "font-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
