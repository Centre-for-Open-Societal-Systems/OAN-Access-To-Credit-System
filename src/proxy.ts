import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
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

  // 1. Define routes that require authentication
  const isDashboardRoute =
    pathname.startsWith('/leads') ||
    pathname.startsWith('/loans') ||
    pathname.startsWith('/loan-application-dashboard') ||
    pathname.startsWith('/update-loan-application-status');
  if (isDashboardRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    return withCsp(NextResponse.redirect(loginUrl));
  }

  // 2. Prevent logged-in users from hitting the login page
  if (pathname === '/login' && token) {
    return withCsp(NextResponse.redirect(new URL('/leads', request.url)));
  }

  return withCsp(NextResponse.next({ request: { headers: requestHeaders } }));
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
function buildCsp(nonce: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  const apiBaseUrl = process.env.API_BASE_URL ?? '';

  const scriptSrc = isProd
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : "script-src 'self' 'unsafe-eval' 'unsafe-inline'";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
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
