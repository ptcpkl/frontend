'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  RefreshCw,
  User,
  XCircle,
} from 'lucide-react';
import { BookingService } from '@/lib/api';
import type { Booking, BookingStatus } from '@/types';

const STATUS_STYLES: Record<BookingStatus, string> = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  Pending: 'Menunggu Verifikasi',
  Approved: 'Diterima',
  Rejected: 'Ditolak',
};

const STATUS_ICONS: Record<BookingStatus, React.ReactNode> = {
  Pending: <Clock className="h-5 w-5" />,
  Approved: <CheckCircle2 className="h-5 w-5" />,
  Rejected: <XCircle className="h-5 w-5" />,
};

const STATUS_DESCRIPTIONS: Record<BookingStatus, string> = {
  Pending: 'Pendaftaran Anda sedang menunggu verifikasi oleh admin.',
  Approved: 'Selamat! Pendaftaran Anda telah diterima.',
  Rejected: 'Mohon maaf, pendaftaran Anda ditolak.',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function UserDashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string; nip: string; department: string } | null>(null);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (data.authenticated) {
        setUser(data.user);
      } else {
        router.replace('/login');
      }
    } catch {
      router.replace('/login');
    }
  }, [router]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BookingService.getByEmail('berq@pertamina.com');
      setBookings(data);
    } catch {
      setError('Gagal memuat data pendaftaran. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
    fetchBookings();
  }, [fetchSession, fetchBookings]);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      approved: bookings.filter((b) => b.status === 'Approved').length,
      pending: bookings.filter((b) => b.status === 'Pending').length,
      rejected: bookings.filter((b) => b.status === 'Rejected').length,
    }),
    [bookings],
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 ring-1 ring-inset ring-sky-500/30">
              <LayoutDashboard className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Dashboard Saya</h1>
              <p className="mt-1 text-sm text-slate-300">
                Pantau status pendaftaran pelatihan Anda.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* User info card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-700 text-white">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.name ?? 'Berq Pratama'}</h2>
              <p className="text-sm text-slate-500">{user?.email ?? 'berq@pertamina.com'}</p>
            </div>
            <div className="ml-auto flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-600">
              <Award className="h-4 w-4 text-sky-600" />
              NIP: {user?.nip ?? '99887766'}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Pendaftaran" value={stats.total} icon={<GraduationCap className="h-5 w-5" />} accent="text-slate-900 bg-slate-100" />
          <StatCard label="Diterima" value={stats.approved} icon={<CheckCircle2 className="h-5 w-5" />} accent="text-emerald-700 bg-emerald-50" />
          <StatCard label="Menunggu" value={stats.pending} icon={<Clock className="h-5 w-5" />} accent="text-amber-700 bg-amber-50" />
          <StatCard label="Ditolak" value={stats.rejected} icon={<XCircle className="h-5 w-5" />} accent="text-rose-700 bg-rose-50" />
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Bookings list */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Riwayat Pendaftaran</h2>
            <button
              type="button"
              onClick={fetchBookings}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Muat Ulang
            </button>
          </div>

          {loading ? (
            <div className="mt-4 space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="h-5 w-48 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-32 rounded bg-slate-100" />
                  <div className="mt-4 h-8 w-28 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <GraduationCap className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">Belum Ada Pendaftaran</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Anda belum mendaftar pelatihan apa pun. Jelajahi katalog pelatihan untuk memulai.
              </p>
              <Link
                href="/trainings"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                <GraduationCap className="h-4 w-4" />
                Lihat Katalog Pelatihan
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-600/20">
                          #{booking.id}
                        </span>
                        <span className="text-xs text-slate-400">
                          Didaftarkan {formatDate(booking.createdAt)}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-slate-900">
                        {booking.trainingTitle ?? `Pelatihan #${booking.trainingId}`}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 text-slate-400" />
                          {booking.department}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {booking.nip}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${STATUS_STYLES[booking.status]}`}
                      >
                        {STATUS_ICONS[booking.status]}
                        {STATUS_LABELS[booking.status]}
                      </span>
                      <p className="max-w-xs text-right text-xs text-slate-500">
                        {STATUS_DESCRIPTIONS[booking.status]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-sky-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ingin mengikuti pelatihan lain?</h3>
              <p className="mt-1 text-sm text-slate-600">
                Jelajahi katalog pelatihan PorTC dan daftarkan diri Anda.
              </p>
            </div>
            <Link
              href="/trainings"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              <GraduationCap className="h-4 w-4" />
              Katalog Pelatihan
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>{icon}</div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}