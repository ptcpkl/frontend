import { NextResponse } from 'next/server';
import {
  ACCESS_TOKEN_COOKIE,
  getSessionMaxAge,
  ROLE_COOKIE,
  type AuthSession,
} from '@/lib/auth';
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

    const response = NextResponse.json({ success: true, user: session }, { status: 201 });
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: getSessionMaxAge(session.expiresAt),
      path: '/',
    };

    response.cookies.set(ACCESS_TOKEN_COOKIE, session.token, options);
    response.cookies.set(ROLE_COOKIE, session.role, options);
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
