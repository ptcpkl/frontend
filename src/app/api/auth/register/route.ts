import { NextResponse } from 'next/server';
import { isAuthSession, toSessionUser, type AuthSession } from '@/lib/auth';
import { setAuthCookies } from '@/lib/auth-cookies';
import { backendRequest, BackendError } from '@/lib/backend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await backendRequest<AuthSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: body.name,
        email: body.email,
        nip: body.nip,
        department: body.department,
        password: body.password,
      }),
    });

    if (!isAuthSession(session)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Backend belum memakai kontrak session terbaru. Pull dan restart backend, lalu coba register lagi.',
          errors: [],
        },
        { status: 502 },
      );
    }

    const response = NextResponse.json(
      { success: true, user: toSessionUser(session) },
      { status: 201, headers: { 'Cache-Control': 'private, no-store' } },
    );
    setAuthCookies(response, session, request);
    return response;
  } catch (error) {
    const backendError = error instanceof BackendError ? error : null;
    return NextResponse.json(
      {
        success: false,
        message: backendError?.message ?? 'Tidak dapat terhubung ke layanan registrasi.',
        errors: backendError?.errors ?? [],
      },
      { status: backendError?.status ?? 503 },
    );
  }
}
