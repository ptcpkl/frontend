import { NextResponse } from 'next/server';
import { isAuthSession, toSessionUser, type AuthSession } from '@/lib/auth';
import { setAuthCookies } from '@/lib/auth-cookies';
import { backendRequest, BackendError } from '@/lib/backend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await backendRequest<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!isAuthSession(session)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Backend belum memakai kontrak session terbaru. Pull dan restart backend, lalu coba login lagi.',
          errors: [],
        },
        { status: 502 },
      );
    }

    const response = NextResponse.json(
      { success: true, user: toSessionUser(session) },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
    setAuthCookies(response, session, request);
    return response;
  } catch (error) {
    const backendError = error instanceof BackendError ? error : null;
    return NextResponse.json(
      {
        success: false,
        message: backendError?.message ?? 'Tidak dapat terhubung ke layanan autentikasi.',
        errors: backendError?.errors ?? [],
      },
      { status: backendError?.status ?? 503 },
    );
  }
}
