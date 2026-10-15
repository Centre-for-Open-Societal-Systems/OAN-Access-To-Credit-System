import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export type SsoFailureReason = 'sso_unavailable' | 'sso_failed' | 'sso_no_access';

/** Where SSO failures land: the Development Agent portal, which explains the `reason`. */
export function backToSsoLogin(request: NextRequest, reason: SsoFailureReason): NextResponse {
  return NextResponse.redirect(new URL(`/login/development-agent?reason=${reason}`, request.url), 303);
}

/**
 * A same-app login page the identity provider may send the browser back to after
 * a logout, or null. Only `/login` and `/login/...` paths are accepted: the value
 * comes from the request body, and the provider redirects wherever it is told.
 */
export function safeLoginPath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return /^\/login(\/[a-z-]+)?$/.test(value) ? value : null;
}
