import { getClientIp } from '@/lib/clientIp';
import { applyIamCookies, forwardIamCallback, iamConfig } from '@/lib/iamSession';
import { backToSsoLogin } from '@/lib/ssoRedirect';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Optional: hides IAM's own callback from the browser. Used only when IAM's
 * login-provider row names this URL as its `oauth_callback_url` (and the
 * Keycloak client allows it); with IAM's default callback, the identity
 * provider sends the browser to IAM directly and this route is never hit.
 *
 * The query (`code`, `state`, …) is handed to IAM's callback server-to-server;
 * IAM exchanges the code and answers with its session cookies plus a redirect
 * to `/api/auth/sso/complete`. The cookies are re-emitted unchanged and the
 * browser follows on to that landing route — only if it is this app's own,
 * since IAM never checks the URL it was given.
 */
export async function GET(request: NextRequest) {
  if (!iamConfig()) return backToSsoLogin(request, 'sso_unavailable');

  const result = await forwardIamCallback(request.nextUrl.search, getClientIp(request));
  if (!result?.location) return backToSsoLogin(request, 'sso_failed');

  const landing = new URL(result.location, request.url);
  if (landing.origin !== request.nextUrl.origin || landing.pathname !== '/api/auth/sso/complete') {
    return backToSsoLogin(request, 'sso_failed');
  }

  const response = NextResponse.redirect(landing, 303);
  applyIamCookies(response, result.setCookies);
  return response;
}
