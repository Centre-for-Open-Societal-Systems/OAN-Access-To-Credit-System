import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path);
}

// Statically export other HTTP verbs by aliasing the GET reference
export { GET as POST, GET as PUT, GET as DELETE };

async function handleProxy(request: NextRequest, pathArray: string[]) {
  const baseUrl = process.env.API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({ message: 'API_BASE_URL is not configured' }, { status: 500 });
  }

  // Construct the target URL
  const targetPath = pathArray.join('/');
  const { search } = new URL(request.url);
  const targetUrl = `${baseUrl}/${targetPath}${search}`;

  // Read auth_token cookie
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
      // For Next.js 13+ route handlers, we can stream the request body directly if it's not a GET/HEAD
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.blob(),
      redirect: 'manual',
    };

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
    console.error(`Proxy error for ${targetUrl}:`, error);
    return NextResponse.json({ message: 'Proxy request failed' }, { status: 502 });
  }
}
