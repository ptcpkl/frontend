export const ACCESS_TOKEN_COOKIE = 'ptc_access_token';
export const REFRESH_TOKEN_COOKIE = 'ptc_refresh_token';
export const ROLE_COOKIE = 'ptc_role';
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function getCookieMaxAge(expiresAt: string, maximum: number): number {
  const expiry = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiry)) return 0;
  const remaining = Math.floor((expiry - Date.now()) / 1000);
  return Math.max(0, Math.min(maximum, remaining));
}

export const DEPARTMENTS = [
  'Corporate Secretary',
  'Legal & Compliance',
  'Internal Audit',
  'Human Capital & General Affair',
  'Information Technology (IT)',
  'Operations',
  'HSSE',
  'Finance',
] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type UserRole = 'User' | 'Admin';

export interface SessionUser {
  id: number;
  fullName: string;
  email: string;
  department: string;
  nip: string;
  role: UserRole;
}

export interface AuthSession extends SessionUser {
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
}

export function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<AuthSession>;
  return (
    typeof session.id === 'number'
    && typeof session.fullName === 'string'
    && typeof session.email === 'string'
    && typeof session.nip === 'string'
    && typeof session.department === 'string'
    && (session.role === 'User' || session.role === 'Admin')
    && typeof session.token === 'string'
    && session.token.length > 0
    && typeof session.refreshToken === 'string'
    && session.refreshToken.length > 0
    && typeof session.expiresAt === 'string'
    && Number.isFinite(Date.parse(session.expiresAt))
    && typeof session.refreshExpiresAt === 'string'
    && Number.isFinite(Date.parse(session.refreshExpiresAt))
  );
}

export function toSessionUser(session: AuthSession): SessionUser {
  const { id, fullName, email, department, nip, role } = session;
  return { id, fullName, email, department, nip, role };
}
