'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import { TrainingService } from '@/lib/api';
import type { Training } from '@/types';

const CATEGORIES = ['Semua Kategori', 'HSE', 'Leadership', 'IT & Energy'];

const CATEGORY_STYLES: Record<string, string> = {
  HSE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Leadership: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  'IT & Energy': 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

function getCategoryStyle(category: string): string {
  return CATEGORY_STYLES[category] ?? 'bg-slate-100 text-slate-700 ring-slate-500/20';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua Kategori');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TrainingService.getAll();
      setTrainings(data);
    } catch {
      setError('Gagal memuat data pelatihan. Pastikan backend .NET Web API sudah berjalan, lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const filteredTrainings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return trainings.filter((training) => {
      const matchesQuery =
        !normalized || training.title.toLowerCase().includes(normalized);
      const matchesCategory = category === 'Semua Kategori' || training.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [trainings, query, category]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/40 via-slate-900 to-slate-900" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              Pertamina Training & Consulting
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Kembangkan Kompetensi,
              <br />
              <span className="bg-gradient-to-r from-sky-400 to-sky-200 bg-clip-text text-transparent">
                Wujudkan Energi Masa Depan
              </span>
            </h1>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Jelajahi program pelatihan enterprise untuk pengembangan kompetensi karyawan Pertamina
              di seluruh Indonesia.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari pelatihan berdasarkan judul..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3 pl-12 pr-4 text-slate-100 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    category === item
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {query.trim() || category !== 'Semua Kategori'
              ? `Hasil (${filteredTrainings.length})`
              : `Semua Pelatihan (${filteredTrainings.length})`}
          </h2>
          <button
            type="button"
            onClick={fetchTrainings}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <RefreshCw className="h-4 w-4" />
            Muat Ulang
          </button>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchTrainings} />
        ) : filteredTrainings.length === 0 ? (
          <EmptyState hasFilters={query.trim().length > 0 || category !== 'Semua Kategori'} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrainings.map((training) => (
              <TrainingCard key={training.id} training={training} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function TrainingCard({ training }: { training: Training }) {
  const isFull = training.availableSeats <= 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden bg-slate-200">
        {training.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={training.imageUrl}
            alt={training.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-600 to-slate-800">
            <span className="text-4xl font-bold text-white/20">{training.category}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getCategoryStyle(training.category)}`}
          >
            {training.category}
          </span>
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              isFull ? 'bg-rose-100 text-rose-700' : 'bg-white/90 text-slate-800'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            {isFull ? 'Kuota Penuh' : `${training.availableSeats} kursi tersisa`}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-bold leading-snug text-slate-900">{training.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{training.description}</p>

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-sky-600" />
            {formatDate(training.startDate)}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-sky-600" />
            {training.duration}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-sky-600" />
            {training.location}
          </div>
        </div>

        <Link
          href={`/trainings/${training.id}`}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          Daftar Pelatihan
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-44 bg-slate-200" />
          <div className="p-6">
            <div className="h-5 w-4/5 rounded bg-slate-200" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full rounded bg-slate-200" />
              <div className="h-3 w-3/4 rounded bg-slate-200" />
            </div>
            <div className="mt-5 space-y-2">
              <div className="h-3 w-1/2 rounded bg-slate-200" />
              <div className="h-3 w-2/5 rounded bg-slate-200" />
              <div className="h-3 w-3/5 rounded bg-slate-200" />
            </div>
            <div className="mt-6 h-10 w-full rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
        <AlertCircle className="h-7 w-7 text-rose-600" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-900">Gagal Memuat Data</h2>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
      >
        <RefreshCw className="h-4 w-4" />
        Coba Lagi
      </button>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <Search className="mx-auto h-10 w-10 text-slate-300" />
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        {hasFilters ? 'Pelatihan tidak ditemukan' : 'Belum ada pelatihan'}
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        {hasFilters
          ? 'Coba ubah kata kunci pencarian atau filter kategori.'
          : 'Data pelatihan akan muncul di sini setelah backend dihubungkan.'}
      </p>
    </div>
  );
}