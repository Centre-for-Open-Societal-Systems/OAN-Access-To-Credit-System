import { getClientIp } from '@/lib/clientIp';
import { iamConfig, startIamLogin } from '@/lib/iamSession';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rateLimit';
import { RATE_LIMITS } from '@/lib/securityConfig';
import { backToSsoLogin } from '@/lib/ssoRedirect';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Development Agent SSO: the portal's button navigates here (a page load, not a
 * fetch — the browser has to follow the identity provider's redirects).
 *
 * Opens a login transaction at IAM server-to-server and sends the browser to the
 * identity provider's login page. After the login the browser comes back to
 * `/api/auth/sso/complete`, which checks the session belongs to this app.
 */
export async function GET(request: NextRequest) {
  if (!iamConfig()) return backToSsoLogin(request, 'sso_unavailable');

  const clientIp = getClientIp(request);
  const limit = checkRateLimit(`sso-login:${clientIp}`, RATE_LIMITS.ssoLogin.limit, RATE_LIMITS.ssoLogin.windowMs);
  if (!limit.allowed) {
    logger.security(`SSO login rate limit exceeded for ${clientIp}`);
    return backToSsoLogin(request, 'sso_unavailable');
  }

  // IAM redirects the browser to this URL once the login is done, without
  // checking it — so it must be absolute (a bare path would resolve against
  // IAM's own host) and must point back at this app.
  const landing = new URL('/api/auth/sso/complete', request.url);

  const providerUrl = await startIamLogin(landing.toString(), clientIp);
  if (!providerUrl) return backToSsoLogin(request, 'sso_unavailable');

  return NextResponse.redirect(providerUrl, 303);
}
