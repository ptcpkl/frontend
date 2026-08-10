import { cookies } from 'next/headers';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  toSessionUser,
  type AuthSession,
  type SessionUser,
} from '@/lib/auth';
import { backendRequest, BackendError } from '@/lib/backend';

export interface ResolvedSession {
  user: SessionUser;
  renewed?: AuthSession;
}

export async function resolveSession(): Promise<ResolvedSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken) {
    try {
      const user = await backendRequest<SessionUser>('/auth/me', {}, accessToken);
      return { user };
    } catch (error) {
      if (!(error instanceof BackendError) || error.status !== 401) return null;
    }
  }

  if (!refreshToken) return null;

  try {
    const renewed = await backendRequest<AuthSession>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    return { user: toSessionUser(renewed), renewed };
  } catch {
    return null;
  }
}
