export const ACCESS_TOKEN_COOKIE = 'ptc_access_token';
export const ROLE_COOKIE = 'ptc_role';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export function getSessionMaxAge(expiresAt: string): number {
  const remaining = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
  return Math.max(0, Math.min(SESSION_MAX_AGE_SECONDS, remaining));
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
}
