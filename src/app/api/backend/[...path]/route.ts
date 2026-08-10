import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth';
import { getApiBaseUrl } from '@/lib/backend';

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: Request, context: RouteContext) {
  const [{ path }, cookieStore] = await Promise.all([context.params, cookies()]);
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const incomingUrl = new URL(request.url);
  const safePath = path.map(encodeURIComponent).join('/');
  const target = `${getApiBaseUrl()}/${safePath}${incomingUrl.search}`;

  const headers = new Headers();
  headers.set('Accept', 'application/json');
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: 'no-store',
    });
    const body = await upstream.text();
    return new NextResponse(body || null, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'private, no-store',
      },
    });
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
