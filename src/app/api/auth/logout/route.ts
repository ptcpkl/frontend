import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { REFRESH_TOKEN_COOKIE } from '@/lib/auth';
import { clearAuthCookies } from '@/lib/auth-cookies';
import { backendRequest } from '@/lib/backend';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    try {
      await backendRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Logout remains idempotent; local cookies are always removed.
    }
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
