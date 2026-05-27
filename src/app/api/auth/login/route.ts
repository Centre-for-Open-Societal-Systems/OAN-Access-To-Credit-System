import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const usr = body?.usr;
    const pwd = body?.pwd;

    if (!usr || !pwd) {
      return NextResponse.json({ message: 'Missing credentials in request' }, { status: 400 });
    }

    // Use the exact destination URL from next.config.mjs to avoid HTTP -> HTTPS redirects dropping the POST body
    const baseUrl = 'https://a2c-backend-development.oanstaging.com';

    // Call external API using a clean slate (like Postman)
    const response = await fetch(`${baseUrl}/api/method/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ usr, pwd }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Invalid credentials. Please try again.' },
        { status: response.status }
      );
    }

    // Extract the JWT token
    const loginDataMessage = data.message;
    const messageObj =
      typeof loginDataMessage === 'object' && loginDataMessage !== null
        ? (loginDataMessage as Record<string, unknown>)
        : undefined;

    const token =
      (data.token as string | undefined) ||
      (data.jwt as string | undefined) ||
      (data.jwt_token as string | undefined) ||
      (data.access_token as string | undefined) ||
      (messageObj && (
        (messageObj.token as string | undefined) ||
        (messageObj.jwt as string | undefined) ||
        (messageObj.api_key as string | undefined)
      ));

    const nextResponse = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: data, // Return the user data to the frontend, excluding the token
    });

    if (token) {
      nextResponse.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        // Optional: you can set maxAge based on "rememberMe" if you pass it in the request
        maxAge: 7 * 24 * 60 * 60, // Default to 7 days
      });
    }

    return nextResponse;
  } catch (error) {
    console.error('Login Proxy Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
