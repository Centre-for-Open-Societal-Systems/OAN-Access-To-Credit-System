import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxy(request, resolvedParams.path);
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
  const search = request.nextUrl.search;
  const targetUrl = `${baseUrl}/${targetPath}${search}`;

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
    if (!['GET', 'HEAD'].includes(request.method)) {
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
    console.error(`Proxy error for ${targetUrl}:`, error);
    return NextResponse.json({ message: 'Proxy request failed' }, { status: 502 });
  }
}
