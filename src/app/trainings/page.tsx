'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CalendarDays, ChevronRight, Clock, GraduationCap, MapPin, RefreshCw, Search, Users } from 'lucide-react';
import { ApiError, TrainingService } from '@/lib/api';
import type { Training } from '@/types';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(value));
}

function durationLabel(training: Training) {
  const days = Math.max(1, Math.ceil((new Date(training.endDate).getTime() - new Date(training.startDate).getTime()) / 86400000));
  return `${days} hari`;
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
      setTrainings(await TrainingService.getAll({ sort: 'startdate' }));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Gagal memuat katalog dari API.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Katalog disinkronkan dari API saat halaman dibuka.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchTrainings(); }, [fetchTrainings]);

  const categories = useMemo(() => ['Semua Kategori', ...Array.from(new Set(trainings.map((item) => item.category))).sort()], [trainings]);
  const filteredTrainings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return trainings.filter((training) =>
      (category === 'Semua Kategori' || training.category === category) &&
      (!normalized || [training.title, training.description, training.location].some((value) => value.toLowerCase().includes(normalized))),
    );
  }, [category, query, trainings]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/40 via-slate-900 to-slate-900" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-300"><span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Pertamina Training & Consulting</div>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-5xl">Kembangkan Kompetensi,<br /><span className="text-sky-400">Wujudkan Energi Masa Depan</span></h1>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">Jelajahi program pelatihan enterprise dan pilih jadwal yang sesuai.</p>
          </div>
          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
            <label className="relative w-full lg:max-w-md"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul, topik, atau lokasi..." className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3 pl-12 pr-4 text-slate-100 outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40" /></label>
            <div className="flex flex-wrap gap-2">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${category === item ? 'bg-sky-600 text-white' : 'border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700'}`}>{item}</button>)}</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-semibold">{query.trim() || category !== 'Semua Kategori' ? `Hasil (${filteredTrainings.length})` : `Semua Pelatihan (${filteredTrainings.length})`}</h2><button type="button" onClick={() => void fetchTrainings()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Muat Ulang</button></div>
        {loading ? <SkeletonGrid /> : error ? <ErrorState message={error} onRetry={fetchTrainings} /> : filteredTrainings.length === 0 ? <EmptyState hasFilters={Boolean(query.trim() || category !== 'Semua Kategori')} /> : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrainings.map((training) => <TrainingCard key={training.id} training={training} />)}
          </div>
        )}
      </section>
    </main>
  );
}

function TrainingCard({ training }: { training: Training }) {
  const isOpen = training.status.toLowerCase() === 'open' && training.availableSeats > 0;
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-sky-600 to-slate-900">
        <GraduationCap className="h-16 w-16 text-white/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-sky-700">{training.category}</span>
        <span className={`absolute bottom-3 left-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${isOpen ? 'bg-white/90 text-slate-800' : 'bg-rose-100 text-rose-700'}`}><Users className="h-3.5 w-3.5" />{isOpen ? `${training.availableSeats} kursi tersisa` : 'Pendaftaran ditutup'}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-bold leading-snug">{training.title}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-500">{training.description}</p>
        <div className="mt-4 space-y-2 text-sm text-slate-600"><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-sky-600" />{formatDate(training.startDate)}</p><p className="flex items-center gap-2"><Clock className="h-4 w-4 text-sky-600" />{durationLabel(training)}</p><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-sky-600" />{training.location}</p></div>
        <Link href={`/trainings/${training.id}`} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">{isOpen ? 'Lihat & Daftar' : 'Lihat Detail'}<ChevronRight className="h-4 w-4" /></Link>
      </div>
    </article>
  );
}

function SkeletonGrid() { return <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[430px] animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="h-44 bg-slate-200" /><div className="space-y-4 p-6"><div className="h-5 w-4/5 rounded bg-slate-200" /><div className="h-3 w-full rounded bg-slate-100" /><div className="h-24 rounded bg-slate-100" /></div></div>)}</div>; }

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm"><AlertCircle className="mx-auto h-8 w-8 text-rose-600" /><h2 className="mt-4 text-lg font-bold">Gagal Memuat Data</h2><p className="mt-2 text-sm text-slate-500">{message}</p><button type="button" onClick={onRetry} className="mt-6 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">Coba Lagi</button></div>; }

function EmptyState({ hasFilters }: { hasFilters: boolean }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Search className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-4 font-semibold">{hasFilters ? 'Pelatihan tidak ditemukan' : 'Belum ada pelatihan'}</h3><p className="mt-1 text-sm text-slate-500">{hasFilters ? 'Coba ubah kata kunci atau kategori.' : 'Data katalog akan tampil setelah tersedia pada API.'}</p></div>; }
