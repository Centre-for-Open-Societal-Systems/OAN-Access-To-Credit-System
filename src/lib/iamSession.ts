import { env } from '@/lib/env';
import { decodeIamAccessToken, type IamClaims } from '@/lib/iamClaims';
import { logger } from '@/lib/logger';
import type { NextResponse } from 'next/server';

// Development Agent single sign-on (ported from oan_grievance_ui). The session
// behind it belongs to the OpenG2P IAM service, not to oan_auth_service. IAM
// runs the Keycloak login, then sets its
// own cookies on the shared parent domain — the access token, the Keycloak
// session id that points at the refresh token IAM keeps in Redis, and a CSRF
// token. This app never copies them into its own `auth_token`/`refresh_token`:
// refreshing has to hand IAM its session-id cookie anyway, so a copy could
// only drift.
//
// The browser never talks to IAM. It only ever sees this app's own
// `/api/auth/*` routes, which call IAM server-to-server through this module —
// the same masking the OpenG2P registry hub does with its `/api/login`,
// `/api/me` and `/api/logout`. This is the only file that knows IAM's paths
// and cookie names; IAM's own error bodies are logged here, never returned.

/** Base names; IAM may prefix them (`*_AUTH_COOKIE_PREFIX`), see `iamCookieName`. */
export const IAM_COOKIES = {
  accessToken: 'X-Access-Token',
  idToken: 'X-ID-Token',
  sessionId: 'X-Session-Id',
  csrf: 'X-CSRF-Token',
} as const;

const HTTP_TIMEOUT_MS = 10_000;

type IamConfig = NonNullable<typeof env.IAM>;

/** IAM's config, or null when SSO is off or misconfigured (logged, never thrown into a request). */
export function iamConfig(): IamConfig | null {
  try {
    return env.IAM;
  } catch (error) {
    logger.error('SSO sign-in is misconfigured:', error);
    return null;
  }
}

export function iamCookieName(base: string, config: IamConfig): string {
  return `${config.cookiePrefix}${base}`;
}

interface CookieReader {
  cookies: { get(name: string): { value: string } | undefined };
}

export interface IamSession {
  accessToken: string | undefined;
  sessionId: string | undefined;
  /** Only sent to IAM's logout, which passes it to the identity provider as `id_token_hint`. */
  idToken?: string | undefined;
  /** Decoded, not verified — routing and display only. IAM and the backend verify. */
  claims: IamClaims | null;
}

/** The IAM session the request carries, or null when it carries none (or SSO is off). */
export function readIamSession(request: CookieReader): IamSession | null {
  const config = iamConfig();
  if (!config) return null;

  const accessToken = request.cookies.get(iamCookieName(IAM_COOKIES.accessToken, config))?.value || undefined;
  const sessionId = request.cookies.get(iamCookieName(IAM_COOKIES.sessionId, config))?.value || undefined;
  if (!accessToken && !sessionId) return null;

  return {
    accessToken,
    sessionId,
    idToken: request.cookies.get(iamCookieName(IAM_COOKIES.idToken, config))?.value || undefined,
    claims: accessToken ? decodeIamAccessToken(accessToken, config.application) : null,
  };
}

/**
 * IAM refreshes only an *expired* access token, and only when it can find the
 * session behind it — so both cookies must be present for a refresh to work.
 */
export function canRefreshIamSession(session: IamSession): boolean {
  return !!session.accessToken && !!session.sessionId;
}

// --- Relaying IAM's Set-Cookie headers -------------------------------------

type CookieOptions = NonNullable<Parameters<NextResponse['cookies']['set']>[2]>;

interface ParsedCookie {
  name: string;
  value: string;
  options: CookieOptions;
}

/**
 * Parses one `Set-Cookie` header so it can go through `response.cookies.set`.
 * Appending the raw header would be simpler, but `NextResponse.cookies`
 * rewrites every `set-cookie` header from its own map on each later `.set()`,
 * silently dropping anything appended behind its back.
 */
function parseSetCookie(header: string): ParsedCookie | null {
  const [pair, ...attributes] = header.split(';');
  const eq = pair?.indexOf('=') ?? -1;
  if (!pair || eq <= 0) return null;

  const name = pair.slice(0, eq).trim();
  const value = pair.slice(eq + 1).trim().replace(/^"(.*)"$/, '$1');
  const options: CookieOptions = {};

  for (const attribute of attributes) {
    const [rawKey, ...rest] = attribute.split('=');
    const key = rawKey?.trim().toLowerCase();
    const attrValue = rest.join('=').trim();
    if (key === 'max-age') options.maxAge = Number(attrValue);
    else if (key === 'expires') options.expires = new Date(attrValue);
    else if (key === 'domain') options.domain = attrValue;
    else if (key === 'path') options.path = attrValue;
    else if (key === 'secure') options.secure = true;
    else if (key === 'httponly') options.httpOnly = true;
    else if (key === 'samesite') {
      const sameSite = attrValue.toLowerCase();
      if (sameSite === 'lax' || sameSite === 'strict' || sameSite === 'none') options.sameSite = sameSite;
    }
  }

  return { name, value, options };
}

/**
 * Re-emits IAM's cookies on `response` exactly as IAM set them (same domain,
 * path and flags), so the browser stores the cookies IAM itself would have.
 * Call after any `clearSessionCookies` on the same response: cookies are
 * keyed by name, so the later write wins.
 */
export function applyIamCookies(response: NextResponse, setCookies: string[]): void {
  for (const header of setCookies) {
    const parsed = parseSetCookie(header);
    if (parsed) response.cookies.set(parsed.name, parsed.value, parsed.options);
  }
}

/** Expires IAM's cookies without calling IAM — for when IAM refuses to renew a session. */
export function expireIamCookies(response: NextResponse): void {
  const config = iamConfig();
  if (!config) return;
  for (const base of Object.values(IAM_COOKIES)) {
    response.cookies.set(iamCookieName(base, config), '', {
      path: '/',
      domain: config.cookieDomain,
      maxAge: 0,
    });
  }
}

/** The value IAM gave a cookie in `setCookies`, ignoring its own clear-before-set (`Max-Age=0`) writes. */
function cookieValueFrom(setCookies: string[], name: string): string | undefined {
  let found: string | undefined;
  for (const header of setCookies) {
    const parsed = parseSetCookie(header);
    if (parsed?.name === name && parsed.value && parsed.options.maxAge !== 0) found = parsed.value;
  }
  return found;
}

// --- Calls to IAM -----------------------------------------------------------

function iamCookieHeader(session: IamSession, config: IamConfig): string {
  const pairs: string[] = [];
  if (session.accessToken) pairs.push(`${iamCookieName(IAM_COOKIES.accessToken, config)}=${session.accessToken}`);
  if (session.sessionId) pairs.push(`${iamCookieName(IAM_COOKIES.sessionId, config)}=${session.sessionId}`);
  if (session.idToken) pairs.push(`${iamCookieName(IAM_COOKIES.idToken, config)}=${session.idToken}`);
  return pairs.join('; ');
}

async function callIam(path: string, init: RequestInit, clientIp: string): Promise<Response> {
  const config = iamConfig();
  if (!config) throw new Error('SSO sign-in is not configured');
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('X-Forwarded-For', clientIp);
  return fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers,
    redirect: 'manual',
    signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
  });
}

/**
 * Opens a login transaction at IAM and returns the identity provider's
 * authorize URL to send the browser to, or null if IAM refused.
 *
 * `returnUrl` is where IAM sends the browser after the callback. IAM does not
 * check it against any allow-list, so the caller must build it itself, as an
 * absolute URL back to this app.
 */
export async function startIamLogin(returnUrl: string, clientIp: string): Promise<string | null> {
  const config = iamConfig();
  if (!config) return null;

  const query = new URLSearchParams({ id: config.loginProviderId, redirect_uri: returnUrl });
  try {
    const response = await callIam(`/auth/start_authentication_transaction?${query}`, { method: 'POST' }, clientIp);
    const data = (await response.json().catch(() => null)) as { redirectUrl?: unknown } | null;
    if (!response.ok || typeof data?.redirectUrl !== 'string') {
      logger.security(`IAM refused to start a login (status ${response.status})`);
      return null;
    }
    const redirectUrl = new URL(data.redirectUrl);
    if (redirectUrl.protocol !== 'https:' && redirectUrl.protocol !== 'http:') return null;
    return redirectUrl.toString();
  } catch (error) {
    logger.error('IAM login start failed:', error);
    return null;
  }
}

/**
 * Hands the identity provider's callback (`?code&state…`) to IAM, which
 * exchanges the code and answers with its session cookies and a redirect to
 * the `returnUrl` given to `startIamLogin`. Returns both, or null when IAM
 * did not open a session (bad or replayed `state`, provider-side error).
 */
export async function forwardIamCallback(
  search: string,
  clientIp: string
): Promise<{ setCookies: string[]; location: string | null; accessToken: string } | null> {
  const config = iamConfig();
  if (!config) return null;

  try {
    const response = await callIam(`/auth/callback${search}`, { method: 'GET' }, clientIp);
    const setCookies = response.headers.getSetCookie();
    const accessToken = cookieValueFrom(setCookies, iamCookieName(IAM_COOKIES.accessToken, config));
    if (response.status < 300 || response.status >= 400 || !accessToken) {
      logger.security(`IAM callback did not open a session (status ${response.status})`);
      return null;
    }
    return { setCookies, location: response.headers.get('location'), accessToken };
  } catch (error) {
    logger.error('IAM callback failed:', error);
    return null;
  }
}

export interface RenewedIamSession {
  accessToken: string;
  claims: IamClaims | null;
  setCookies: string[];
}

/**
 * Asks IAM for a fresh access token. IAM has no refresh endpoint of its own:
 * its auth middleware refreshes an expired token on any authenticated route
 * and returns the new cookies, so this calls the cheapest one
 * (`get_user_profile`, a GET, so no CSRF token is needed).
 *
 * Returns null when IAM ended the session (refresh token expired or revoked).
 * A token that had not expired yet comes back unchanged.
 */
export async function refreshIamSession(session: IamSession, clientIp: string): Promise<RenewedIamSession | null> {
  const config = iamConfig();
  if (!config || !canRefreshIamSession(session)) return null;

  try {
    const response = await callIam(
      '/auth/get_user_profile',
      { method: 'GET', headers: { Cookie: iamCookieHeader(session, config) } },
      clientIp
    );
    if (!response.ok) {
      logger.security(`IAM refused to refresh a session (status ${response.status})`);
      return null;
    }
    const setCookies = response.headers.getSetCookie();
    const accessToken =
      cookieValueFrom(setCookies, iamCookieName(IAM_COOKIES.accessToken, config)) ?? session.accessToken!;
    return { accessToken, claims: decodeIamAccessToken(accessToken, config.application), setCookies };
  } catch (error) {
    logger.error('IAM refresh failed:', error);
    return null;
  }
}

/**
 * Ends the session at IAM (it deletes the refresh token it holds in Redis)
 * and returns IAM's cookie-clearing headers plus the identity provider's
 * logout URL, for the browser to visit so the provider's own SSO session
 * ends too.
 *
 * IAM answers its logout with a redirect to that URL, built from the
 * provider's discovery document — so no identity-provider detail is
 * configured here. The redirect is not followed server-side (the provider's
 * session lives in the browser's cookies, not ours). Its
 * `post_logout_redirect_uri` is IAM's one fixed portal URL; it is replaced
 * with `afterLogoutUrl`, which the provider client must allow as a redirect.
 *
 * Best effort: on any failure the session is still ended here, just not at
 * the provider — `providerLogoutUrl` is null and the caller lands locally.
 */
export async function revokeIamSession(
  session: IamSession,
  afterLogoutUrl: string,
  clientIp: string
): Promise<{ setCookies: string[]; providerLogoutUrl: string | null }> {
  const config = iamConfig();
  if (!config || !session.accessToken) return { setCookies: [], providerLogoutUrl: null };

  try {
    const response = await callIam(
      '/auth/logout',
      { method: 'GET', headers: { Cookie: iamCookieHeader(session, config) } },
      clientIp
    );
    if (response.status >= 400) logger.security(`IAM logout answered ${response.status}`);
    return {
      setCookies: response.headers.getSetCookie(),
      providerLogoutUrl: providerLogoutUrl(response.headers.get('location'), afterLogoutUrl),
    };
  } catch (error) {
    logger.error('IAM logout failed:', error);
    return { setCookies: [], providerLogoutUrl: null };
  }
}

function providerLogoutUrl(location: string | null, afterLogoutUrl: string): string | null {
  if (!location) return null;
  try {
    const url = new URL(location);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    url.searchParams.set('post_logout_redirect_uri', afterLogoutUrl);
    return url.toString();
  } catch {
    return null;
  }
}
