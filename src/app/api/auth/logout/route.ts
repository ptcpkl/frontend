import { NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, ROLE_COOKIE } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' });
  response.cookies.set(ROLE_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' });
  return response;
}
