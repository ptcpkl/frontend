import 'server-only';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

export class BackendError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors: string[] = [],
  ) {
    super(message);
  }
}

export function getApiBaseUrl(): string {
  return (process.env.API_BASE_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');
}

export async function backendRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    throw new BackendError(
      payload?.message ?? 'Layanan API sedang tidak tersedia.',
      response.status,
      payload?.errors ?? [],
    );
  }

  return payload.data;
}
