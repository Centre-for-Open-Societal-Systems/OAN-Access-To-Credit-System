import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { buildClientResponse, buildUpstreamHeaders } from '@/lib/proxyHeaders';
import { AUTH_TOKEN_COOKIE, idleSessionResponse, isIdleExpired } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;

  // Prevent path traversal attacks by rejecting relative path indicators and encoded separators
  if (path.some(segment => segment.includes('..') || segment === '.' || /%2[ef]/i.test(segment) || segment.includes('\\'))) {
    return NextResponse.json({ message: 'Invalid file path' }, { status: 400 });
  }

  // Same idle enforcement as /api/proxy — the middleware never sees /api, so a
  // route that reaches the backend has to check the timeout itself.
  if (isIdleExpired(request)) {
    logger.security('Rejected a file request from an idle session');
    return idleSessionResponse();
  }

  // Safely construct the full URL so query params can't smuggle in path segments.
  const rawPath = path.join('/');
  const upstreamPath = `/files/${rawPath}`;
  const targetUrlObj = new URL(upstreamPath, env.API_BASE_URL);
  if (!targetUrlObj.pathname.startsWith('/files/')) {
    return NextResponse.json({ message: 'Invalid file path' }, { status: 400 });
  }
  targetUrlObj.search = request.nextUrl.search;
  const targetUrl = targetUrlObj.toString();

  const authToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const headers = buildUpstreamHeaders(request, authToken);

  try {
    // Redirects are followed here rather than relayed (fetch's default), so no
    // 3xx ever reaches the relay below and no Location has to be rewritten.
    // Following server-side keeps the backend's URL out of the browser
    // entirely, which is the point of proxying files in the first place.
    //
    // /api/proxy takes the other route — `redirect: 'manual'` — and so passes a
    // `proxyPrefix` to have Location rewritten instead. Either is fine; what is
    // not fine is manual redirects with no prefix, which drops the header and
    // hands the browser a redirect with no destination.
    const response = await fetch(targetUrl, { headers });

    // Same relay rules as /api/proxy: allowlisted response headers so a
    // backend Set-Cookie can never shadow the session cookies, and the file
    // body streamed through untouched (only JSON is buffered/sanitized, which
    // here means just the error responses).
    const { body, init } = await buildClientResponse(response, targetUrl);
    return new NextResponse(body, init);
  } catch (error) {
    logger.error(`Files proxy error for ${targetUrl}:`, error);
    return NextResponse.json({ message: 'Proxy request failed' }, { status: 502 });
  }
}
