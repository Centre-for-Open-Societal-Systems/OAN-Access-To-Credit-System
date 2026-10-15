import { readAppIamSession } from '@/lib/activeSession';
import { getClientIp } from '@/lib/clientIp';
import { checkCsrf } from '@/lib/csrf';
import { isIamTokenExpired } from '@/lib/iamClaims';
import { applyIamCookies, canRefreshIamSession, refreshIamSession } from '@/lib/iamSession';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { buildClientResponse, buildUpstreamHeaders } from '@/lib/proxyHeaders';
import { AUTH_TOKEN_COOKIE, idleSessionResponse, isIdleExpired, REFRESH_TOKEN_COOKIE } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ path: string[] }> };

// One shared handler exported per HTTP verb so method semantics are explicit
// at the routing layer (and mutating verbs go through the CSRF guard below).
async function handler(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return handleProxy(request, path);
}

export {
    handler as GET,
    handler as POST,
    handler as PUT,
    handler as PATCH,
    handler as DELETE,
};

async function handleProxy(request: NextRequest, pathArray: string[]) {
  const isMutating = !['GET', 'HEAD'].includes(request.method);

  // CSRF: reject cross-origin state-changing requests.
  if (isMutating) {
    const csrfError = checkCsrf(request);
    if (csrfError) return csrfError;
  }

  // Idle timeout. The middleware's matcher excludes /api, so without this an
  // idle tab sitting on an already-rendered page kept reaching the backend until
  // its next navigation — up to a full timeout window past the cut-off.
  if (isIdleExpired(request)) {
    logger.security('Rejected a proxied request from an idle session');
    return idleSessionResponse();
  }

  // Construct the target URL
  const targetPath = pathArray.join('/');
  const search = request.nextUrl.search;
  const targetUrl = `${env.API_BASE_URL}/${targetPath}${search}`;

  let authToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

  // An SSO (IAM) session: its access token is forwarded as the Bearer token, the
  // same as ours, and oan_auth_service validates it with IAM. IAM has no refresh
  // endpoint for the client to call, so an expired token is renewed here, before
  // the request goes out, and IAM's new cookies ride back on this response.
  let iamSetCookies: string[] = [];
  if (!authToken && !request.cookies.get(REFRESH_TOKEN_COOKIE)?.value) {
    const iam = readAppIamSession(request);
    authToken = iam?.accessToken;
    if (iam?.claims && isIamTokenExpired(iam.claims) && canRefreshIamSession(iam)) {
      const renewed = await refreshIamSession(iam, getClientIp(request));
      if (renewed) {
        authToken = renewed.accessToken;
        iamSetCookies = renewed.setCookies;
      }
    }
  }

  // Allowlisted client headers plus a trustworthy X-Forwarded-For and the JWT
  // injected from the httpOnly cookie. See lib/proxyHeaders.ts for why both
  // directions are filtered rather than blocklisted.
  const headers = buildUpstreamHeaders(request, authToken);

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      redirect: 'manual',
    };

    // Only add body if it's not a GET/HEAD request
    if (isMutating) {
      fetchOptions.body = await request.blob();
    }

    // Forward the request to the external backend
    const response = await fetch(targetUrl, fetchOptions);

    // Relay it back with response headers allowlisted (no Set-Cookie, no stack
    // disclosure) and Frappe's debug fields stripped from JSON bodies.
    //
    // `redirect: 'manual'` above means a 3xx arrives here intact, so the relay
    // needs the prefix to rewrite Location onto — otherwise the browser gets a
    // redirect with no destination. (/api/files follows redirects upstream and
    // so passes no prefix.)
    const { body, init } = await buildClientResponse(response, targetUrl, {
      proxyPrefix: '/api/proxy',
    });
    const clientResponse = new NextResponse(body, init);
    applyIamCookies(clientResponse, iamSetCookies);
    return clientResponse;
  } catch (error) {
    const safeTargetUrl = `${env.API_BASE_URL}/${targetPath}`;
    logger.error(`Proxy error for ${safeTargetUrl}:`, error);
    return NextResponse.json({ message: 'Proxy request failed' }, { status: 502 });
  }
}
