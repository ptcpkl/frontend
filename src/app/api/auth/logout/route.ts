import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  ROLE_COOKIE_NAME,
  USER_NAME_COOKIE,
  USER_EMAIL_COOKIE,
  USER_DEPARTMENT_COOKIE,
  USER_NIP_COOKIE,
} from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout berhasil',
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  };

  response.cookies.set(AUTH_COOKIE_NAME, '', cookieOptions);
  response.cookies.set(ROLE_COOKIE_NAME, '', cookieOptions);
  response.cookies.set(USER_NAME_COOKIE, '', cookieOptions);
  response.cookies.set(USER_EMAIL_COOKIE, '', cookieOptions);
  response.cookies.set(USER_DEPARTMENT_COOKIE, '', cookieOptions);
  response.cookies.set(USER_NIP_COOKIE, '', cookieOptions);

  return response;
}