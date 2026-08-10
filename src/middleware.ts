import { NextResponse, type NextRequest } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_VALUE,
  ROLE_COOKIE_NAME,
  type UserRole,
} from '@/lib/auth';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get(AUTH_COOKIE_NAME)?.value === AUTH_COOKIE_VALUE;
  const role = request.cookies.get(ROLE_COOKIE_NAME)?.value as UserRole | undefined;
  const { pathname } = request.nextUrl;

  // Protect admin routes - only admin role can access
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated || role !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Protect user dashboard - only authenticated user role can access
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated || role !== 'user') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};