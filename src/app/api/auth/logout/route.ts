import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  // Clear the HttpOnly auth_token cookie
  response.cookies.delete('auth_token');
  
  return response;
}
