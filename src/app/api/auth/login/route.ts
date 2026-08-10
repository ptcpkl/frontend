import { NextResponse } from 'next/server';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_NAME,
  ADMIN_DEPARTMENT,
  ADMIN_NIP,
  USER_EMAIL,
  USER_PASSWORD,
  USER_NAME,
  USER_DEPARTMENT,
  USER_NIP,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_VALUE,
  ROLE_COOKIE_NAME,
  USER_NAME_COOKIE,
  USER_EMAIL_COOKIE,
  USER_DEPARTMENT_COOKIE,
  USER_NIP_COOKIE,
  type UserRole,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    let role: UserRole | null = null;
    let name = '';
    let department = '';
    let nip = '';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      role = 'admin';
      name = ADMIN_NAME;
      department = ADMIN_DEPARTMENT;
      nip = ADMIN_NIP;
    } else if (email === USER_EMAIL && password === USER_PASSWORD) {
      role = 'user';
      name = USER_NAME;
      department = USER_DEPARTMENT;
      nip = USER_NIP;
    }

    if (role) {
      const response = NextResponse.json({
        success: true,
        message: 'Login berhasil',
        role,
        user: { name, email, department, nip },
      });

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 8, // 8 jam
        path: '/',
      };

      response.cookies.set(AUTH_COOKIE_NAME, AUTH_COOKIE_VALUE, cookieOptions);
      response.cookies.set(ROLE_COOKIE_NAME, role, cookieOptions);
      response.cookies.set(USER_NAME_COOKIE, name, cookieOptions);
      response.cookies.set(USER_EMAIL_COOKIE, email, cookieOptions);
      response.cookies.set(USER_DEPARTMENT_COOKIE, department, cookieOptions);
      response.cookies.set(USER_NIP_COOKIE, nip, cookieOptions);

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Email atau password salah' },
      { status: 401 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 },
    );
  }
}