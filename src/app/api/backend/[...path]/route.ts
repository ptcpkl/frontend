import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ACCESS_TOKEN_COOKIE,
  isAuthSession,
  REFRESH_TOKEN_COOKIE,
  type AuthSession,
} from '@/lib/auth';
import { clearAuthCookies, setAuthCookies } from '@/lib/auth-cookies';
import { backendRequest } from '@/lib/backend';
import { getApiBaseUrl } from '@/lib/backend';

type RouteContext = { params: Promise<{ path: string[] }> };

function isUnsafeCrossOrigin(request: Request) {
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    return false;
  }

  const origin = request.headers.get('origin');
  return Boolean(origin && origin !== new URL(request.url).origin);
}

async function proxy(request: Request, context: RouteContext) {
  if (isUnsafeCrossOrigin(request)) {
    return NextResponse.json(
      { success: false, message: 'Origin permintaan tidak diizinkan.', data: null, errors: [] },
      { status: 403 },
    );
  }

  const [{ path }, cookieStore] = await Promise.all([context.params, cookies()]);
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const incomingUrl = new URL(request.url);
  const safePath = path.map(encodeURIComponent).join('/');
  const target = `${getApiBaseUrl()}/${safePath}${incomingUrl.search}`;
  const contentType = request.headers.get('content-type');
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text();

  const send = (token?: string) => {
    const headers = new Headers({ Accept: 'application/json' });
    if (contentType) headers.set('Content-Type', contentType);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(target, { method: request.method, headers, body, cache: 'no-store' });
  };

  try {
    let upstream = await send(accessToken);
    let renewed: AuthSession | null = null;

    if (upstream.status === 401 && refreshToken) {
      try {
        renewed = await backendRequest<AuthSession>('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
        if (!isAuthSession(renewed)) throw new Error('Invalid refresh response');
        upstream = await send(renewed.token);
      } catch {
        const response = NextResponse.json(
          { success: false, message: 'Sesi telah berakhir. Silakan login kembali.', data: null, errors: [] },
          { status: 401 },
        );
        clearAuthCookies(response, request);
        return response;
      }
    }

    const response = new NextResponse((await upstream.text()) || null, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'private, no-store',
      },
    });
    if (renewed) setAuthCookies(response, renewed, request);
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Backend .NET sedang tidak dapat dijangkau.', data: null, errors: [] },
      { status: 503 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
