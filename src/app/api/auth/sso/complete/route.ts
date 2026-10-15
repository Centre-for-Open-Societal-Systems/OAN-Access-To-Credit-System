import { homeRouteFor, kindFromRoles } from '@/features/auth/rbac';
import { iamConfig, readIamSession } from '@/lib/iamSession';
import { clearSessionCookies } from '@/lib/session';
import { backToSsoLogin } from '@/lib/ssoRedirect';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Where SSO lands once IAM has opened the session: the URL
 * `/api/auth/sso/login` gave IAM as its post-login redirect. IAM's cookies
 * (shared parent domain) arrive with this request — set by IAM's own callback
 * or relayed by `/api/auth/sso/callback`.
 *
 * Drops any local session the browser still held, so the routing middleware
 * (which prefers a local session) cannot mix the two up.
 *
 * Answers with a tiny page that navigates on, not a 30x: the redirect chain
 * that got here started at the identity provider, and a browser withholds
 * `SameSite=Strict` cookies on every hop of a chain that started cross-site.
 * A navigation this page starts itself is same-site.
 */
export async function GET(request: NextRequest) {
  if (!iamConfig()) return backToSsoLogin(request, 'sso_unavailable');

  const session = readIamSession(request);
  if (!session?.claims) return backToSsoLogin(request, 'sso_failed');

  // Signed in at IAM, but holds no role of this app on the IAM client. Their
  // session is left alone: it is still valid for the apps it is for.
  const kind = kindFromRoles(session.claims.roles);
  if (!kind) return backToSsoLogin(request, 'sso_no_access');

  const href = homeRouteFor(kind);

  const response = new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${href}"><title>Signing in</title></head><body><a href="${href}">Continue</a></body></html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      },
    }
  );
  clearSessionCookies(response);
  return response;
}
