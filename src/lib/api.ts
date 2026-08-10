import type {
  Booking,
  BookingStatus,
  CreateBookingDto,
  DashboardSummary,
  Training,
  TrainingInput,
} from '@/types';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

interface ProblemDetails {
  title?: string;
  detail?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors: string[] = [],
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/backend${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
    cache: 'no-store',
  });
  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | ProblemDetails
    | null;

  if (!response.ok || !payload || !('success' in payload) || !payload.success) {
    const envelope = payload && 'success' in payload ? payload : null;
    const problem = payload && !('success' in payload) ? payload : null;
    const notFoundMessage = response.status === 404
      ? 'Endpoint API belum tersedia. Jalankan backend versi terbaru lalu coba lagi.'
      : null;
    throw new ApiError(
      envelope?.message ?? problem?.detail ?? problem?.title ?? notFoundMessage ?? 'Permintaan tidak dapat diproses.',
      response.status,
      envelope?.errors ?? [],
    );
  }

  return payload.data;
}

export const TrainingService = {
  getAll: async (filters?: { search?: string; category?: string; sort?: string }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.sort) params.set('sort', filters.sort);
    const query = params.size ? `?${params}` : '';
    return request<Training[]>(`/trainings${query}`);
  },
  getById: (id: string | number) => request<Training>(`/trainings/${id}`),
  create: (data: TrainingInput) => request<Training>('/trainings', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: TrainingInput) => request<Training>(`/trainings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/trainings/${id}`, { method: 'DELETE' }),
};

export const BookingService = {
  getAll: () => request<Booking[]>('/bookings'),
  getMine: () => request<Booking[]>('/bookings/me'),
  create: (data: CreateBookingDto) =>
    request<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: number, status: Exclude<BookingStatus, 'Pending' | 'Cancelled'>) =>
    request<Booking>(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  cancel: (id: number) => request<Booking>(`/bookings/${id}`, { method: 'DELETE' }),
};

export const DashboardService = {
  getSummary: () => request<DashboardSummary>('/dashboard'),
};
