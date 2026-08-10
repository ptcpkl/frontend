'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, CalendarDays, MapPin, Search, Users } from 'lucide-react';
import { ApiError, TrainingService } from '@/lib/api';
import type { Training } from '@/types';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value));
}

function durationLabel(training: Training) {
  const days = Math.max(
    1,
    Math.ceil((new Date(training.endDate).getTime() - new Date(training.startDate).getTime()) / 86400000),
  );
  return `${days} hari`;
}

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');
  const [sort, setSort] = useState<'date' | 'title' | 'seats'>('date');

  useEffect(() => {
    TrainingService.getAll({ sort: 'startdate' })
      .then(setTrainings)
      .catch((cause) =>
        setError(cause instanceof ApiError ? cause.message : 'Katalog belum dapat dimuat.'),
      )
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ['Semua', ...Array.from(new Set(trainings.map((item) => item.category))).sort()],
    [trainings],
  );

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return trainings
      .filter(
        (item) =>
          (category === 'Semua' || item.category === category) &&
          (!normalized ||
            item.title.toLowerCase().includes(normalized) ||
            item.description.toLowerCase().includes(normalized) ||
            item.location.toLowerCase().includes(normalized)),
      )
      .sort((a, b) => {
        if (sort === 'title') return a.title.localeCompare(b.title);
        if (sort === 'seats') return b.availableSeats - a.availableSeats;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
  }, [category, query, sort, trainings]);

  return (
    <main className="min-h-screen bg-[#f4f1e9]">
      <header className="border-b border-[#101b2d]/20 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-10 lg:px-16">
          <p className="technical-label text-[#d92d20]">Program directory / 2026</p>
          <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <h1 className="display-type max-w-3xl text-6xl leading-[0.9] sm:text-7xl">
              Katalog untuk pekerjaan yang terus berubah.
            </h1>
            <p className="max-w-sm text-sm leading-6 text-slate-600">
              Cari topik, periksa jadwal dan kursi yang tersedia, lalu kirim pendaftaran melalui satu alur.
            </p>
          </div>
        </div>
      </header>

      <section className="sticky top-[68px] z-30 border-b border-[#101b2d]/20 bg-[#f4f1e9]/95 backdrop-blur">
        <div className="mx-auto grid max-w-[1440px] gap-3 px-5 py-4 sm:px-10 md:grid-cols-[1fr_220px_180px] lg:px-16">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari judul, topik, atau lokasi"
              className="h-12 w-full border border-[#101b2d]/30 bg-white pl-11 pr-4 text-sm outline-none focus:border-[#d92d20]"
            />
          </label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-12 border border-[#101b2d]/30 bg-white px-4 text-sm font-bold outline-none focus:border-[#d92d20]"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="h-12 border border-[#101b2d]/30 bg-white px-4 text-sm font-bold outline-none focus:border-[#d92d20]"
          >
            <option value="date">Jadwal terdekat</option>
            <option value="title">Judul A–Z</option>
            <option value="seats">Kursi terbanyak</option>
          </select>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-10 lg:px-16">
        <div className="mb-5 flex items-center justify-between">
          <p className="technical-label text-slate-500">
            {loading ? 'Memuat program' : `${visible.length} program ditemukan`}
          </p>
        </div>

        {error ? (
          <div className="flex items-start gap-3 border border-[#d92d20] bg-white p-5 text-sm text-[#b42318]">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Katalog tidak dapat dijangkau</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="grid gap-px bg-[#101b2d]/20 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-96 animate-pulse bg-white" />
            ))}
          </div>
        ) : visible.length ? (
          <div className="grid gap-px bg-[#101b2d]/20 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((training, index) => (
              <article key={training.id} className="group flex min-h-[390px] flex-col bg-white p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="technical-label text-[#d92d20]">{training.category}</p>
                    <p className="mt-1 font-mono text-xs text-slate-400">
                      PTC-{String(training.id).padStart(3, '0')} / {String(index + 1).padStart(2, '0')}
                    </p>
                  </div>
                  <span
                    className={`border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${
                      training.availableSeats > 0 && training.status.toLowerCase() === 'open'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-slate-400 text-slate-500'
                    }`}
                  >
                    {training.availableSeats > 0 ? `${training.availableSeats} kursi` : 'Penuh'}
                  </span>
                </div>

                <h2 className="display-type mt-10 text-3xl leading-[1.02] group-hover:text-[#d92d20]">
                  {training.title}
                </h2>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{training.description}</p>

                <dl className="mt-auto grid grid-cols-2 gap-x-5 gap-y-3 border-t border-[#101b2d]/15 pt-5 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarDays className="h-4 w-4 text-[#d92d20]" />
                    {formatDate(training.startDate)}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-[#d92d20]" />
                    <span className="truncate">{training.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="h-4 w-4 text-[#d92d20]" />
                    Kuota {training.quota}
                  </div>
                  <div className="font-mono text-slate-500">{durationLabel(training)}</div>
                </dl>

                <Link
                  href={`/trainings/${training.id}`}
                  className="mt-6 inline-flex items-center justify-between border-t border-[#101b2d] pt-4 text-sm font-black"
                >
                  Lihat detail
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[#101b2d]/30 bg-white px-6 py-24 text-center">
            <p className="display-type text-3xl">Belum ada program yang cocok.</p>
            <button className="mt-4 text-sm font-bold text-[#d92d20]" onClick={() => { setQuery(''); setCategory('Semua'); }}>
              Bersihkan pencarian
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
