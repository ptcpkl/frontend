export const ACCESS_TOKEN_COOKIE = 'ptc_access_token';
export const REFRESH_TOKEN_COOKIE = 'ptc_refresh_token';
export const ROLE_COOKIE = 'ptc_role';
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function getCookieMaxAge(expiresAt: string, maximum: number): number {
  const remaining = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
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

export function toSessionUser(session: AuthSession): SessionUser {
  const { id, fullName, email, department, nip, role } = session;
  return { id, fullName, email, department, nip, role };
}
