import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { checkCsrf } from '@/lib/csrf';

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

  // Construct the target URL
  const targetPath = pathArray.join('/');
  const search = request.nextUrl.search;
  const targetUrl = `${env.API_BASE_URL}/${targetPath}${search}`;

  const authToken = request.cookies.get('auth_token')?.value;

  // Prepare headers
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // Avoid forwarding headers that might cause issues
    if (!['host', 'cookie', 'connection', 'content-length'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // Inject Authorization header if we have the token
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  try {
    // Prepare fetch options
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

    // Forward the response back to the client
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding'); // Let Next.js handle encoding

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    logger.error(`Proxy error for ${targetUrl}:`, error);
    return NextResponse.json({ message: 'Proxy request failed' }, { status: 502 });
  }
}
