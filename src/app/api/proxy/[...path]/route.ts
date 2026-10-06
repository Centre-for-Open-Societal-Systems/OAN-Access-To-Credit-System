import { checkCsrf } from '@/lib/csrf';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { buildClientResponse, buildUpstreamHeaders } from '@/lib/proxyHeaders';
import { AUTH_TOKEN_COOKIE, idleSessionResponse, isIdleExpired } from '@/lib/session';
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

  const authToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

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
    return new NextResponse(body, init);
  } catch (error) {
    const safeTargetUrl = `${env.API_BASE_URL}/${targetPath}`;
    logger.error(`Proxy error for ${safeTargetUrl}:`, error);
    return NextResponse.json({ message: 'Proxy request failed' }, { status: 502 });
  }
}
