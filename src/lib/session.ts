import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_VALUE,
  ROLE_COOKIE_NAME,
  USER_NAME_COOKIE,
  USER_EMAIL_COOKIE,
  USER_DEPARTMENT_COOKIE,
  USER_NIP_COOKIE,
  type SessionUser,
} from '@/lib/auth';

export function getSession(): SessionUser | null {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get(AUTH_COOKIE_NAME)?.value === AUTH_COOKIE_VALUE;

  if (!isAuthenticated) return null;

  const role = cookieStore.get(ROLE_COOKIE_NAME)?.value;
  const name = cookieStore.get(USER_NAME_COOKIE)?.value;
  const email = cookieStore.get(USER_EMAIL_COOKIE)?.value;
  const department = cookieStore.get(USER_DEPARTMENT_COOKIE)?.value;
  const nip = cookieStore.get(USER_NIP_COOKIE)?.value;

  if (!role || !name || !email) return null;

  return {
    name,
    email,
    department: department ?? '',
    nip: nip ?? '',
    role: role === 'admin' ? 'admin' : 'user',
  };
}