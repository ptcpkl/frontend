import 'server-only';
import type { NextResponse } from 'next/server';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  getCookieMaxAge,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  ROLE_COOKIE,
  type AuthSession,
} from '@/lib/auth';

function cookieOptions(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedProtocol = request.headers.get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim()
    .toLowerCase();

  return {
    httpOnly: true,
    // `next start` memakai NODE_ENV=production, termasuk saat dijalankan lewat
    // HTTP lokal. Cookie Secure hanya boleh dipakai jika request memang HTTPS.
    secure: requestUrl.protocol === 'https:' || forwardedProtocol === 'https',
    sameSite: 'lax' as const,
    path: '/',
  };
}

export function setAuthCookies(response: NextResponse, session: AuthSession, request: Request) {
  const baseOptions = cookieOptions(request);
  response.cookies.set(ACCESS_TOKEN_COOKIE, session.token, {
    ...baseOptions,
    maxAge: getCookieMaxAge(session.expiresAt, ACCESS_TOKEN_MAX_AGE_SECONDS),
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, session.refreshToken, {
    ...baseOptions,
    maxAge: getCookieMaxAge(session.refreshExpiresAt, REFRESH_TOKEN_MAX_AGE_SECONDS),
  });
  response.cookies.set(ROLE_COOKIE, session.role, {
    ...baseOptions,
    maxAge: getCookieMaxAge(session.refreshExpiresAt, REFRESH_TOKEN_MAX_AGE_SECONDS),
  });
}

export function clearAuthCookies(response: NextResponse, request: Request) {
  const baseOptions = cookieOptions(request);
  for (const name of [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, ROLE_COOKIE]) {
    response.cookies.set(name, '', { ...baseOptions, maxAge: 0 });
  }
}
