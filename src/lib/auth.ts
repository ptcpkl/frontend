export const ADMIN_EMAIL = 'admin@ptc.com';
export const ADMIN_PASSWORD = 'admin321';
export const ADMIN_NAME = 'Admin PTC';
export const ADMIN_DEPARTMENT = 'Information Technology (IT)';
export const ADMIN_NIP = '00000001';

export const USER_EMAIL = 'berq@pertamina.com';
export const USER_PASSWORD = 'berkeganteng123';
export const USER_NAME = 'Berq Pratama';
export const USER_DEPARTMENT = 'Information Technology (IT)';
export const USER_NIP = '99887766';

export const AUTH_COOKIE_NAME = 'ptc_auth';
export const AUTH_COOKIE_VALUE = 'authenticated';
export const ROLE_COOKIE_NAME = 'ptc_role';
export const USER_NAME_COOKIE = 'ptc_user_name';
export const USER_EMAIL_COOKIE = 'ptc_user_email';
export const USER_DEPARTMENT_COOKIE = 'ptc_user_department';
export const USER_NIP_COOKIE = 'ptc_user_nip';

export const DEPARTMENTS = [
  'Corporate Secretary',
  'Chief Legal Compliance / Legal',
  'Chief Audit / Internal Audit',
  'Human Capital & General Affair',
  'Information Technology (IT)',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export type UserRole = 'admin' | 'user';

export interface SessionUser {
  name: string;
  email: string;
  department: string;
  nip: string;
  role: UserRole;
}