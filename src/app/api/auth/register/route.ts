import { NextResponse } from 'next/server';
import { toSessionUser, type AuthSession } from '@/lib/auth';
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

    const response = NextResponse.json(
      { success: true, user: toSessionUser(session) },
      { status: 201 },
    );
    setAuthCookies(response, session);
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
