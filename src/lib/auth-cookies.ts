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

const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export function setAuthCookies(response: NextResponse, session: AuthSession) {
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

export function clearAuthCookies(response: NextResponse) {
  for (const name of [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, ROLE_COOKIE]) {
    response.cookies.set(name, '', { ...baseOptions, maxAge: 0 });
  }
}
