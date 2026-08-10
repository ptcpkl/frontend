import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE, type SessionUser } from '@/lib/auth';
import { backendRequest } from '@/lib/backend';

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    return await backendRequest<SessionUser>('/auth/me', {}, token);
  } catch {
    return null;
  }
}
