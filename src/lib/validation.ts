export const PERTAMINA_EMAIL_PATTERN = /^[A-Za-z0-9._%+\-]+@pertamina[.]com$/;
export const NIP_PATTERN = /^\d{6,20}$/;

export function validatePertaminaEmail(value: string): string | null {
  if (!value.trim()) return 'Email wajib diisi.';
  if (!PERTAMINA_EMAIL_PATTERN.test(value.trim())) {
    return 'Email harus menggunakan domain @pertamina.com. Contoh: nama@pertamina.com.';
  }
  return null;
}

export function validateNip(value: string): string | null {
  if (!value.trim()) return 'NIP wajib diisi.';
  if (!NIP_PATTERN.test(value.trim())) {
    return 'NIP harus berisi 6-20 digit angka. Contoh: 12345678.';
  }
  return null;
}

export function fieldForServerError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes('email')) return 'email';
  if (normalized.includes('nip')) return 'nip';
  if (normalized.includes('nama')) return 'name';
  if (normalized.includes('departemen')) return 'department';
  if (normalized.includes('password')) return 'password';
  return null;
}
