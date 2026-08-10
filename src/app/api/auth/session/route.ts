import { NextResponse } from 'next/server';
import { clearAuthCookies, setAuthCookies } from '@/lib/auth-cookies';
import { resolveSession } from '@/lib/session';

export async function GET() {
  const session = await resolveSession();
  const response = NextResponse.json(
    session
      ? { authenticated: true, user: session.user }
      : { authenticated: false, user: null },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );

  if (session?.renewed) setAuthCookies(response, session.renewed);
  if (!session) clearAuthCookies(response);
  return response;
}
