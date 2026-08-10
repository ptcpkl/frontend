'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  RotateCcw,
  User,
  XCircle,
} from 'lucide-react';
import { ApiError, BookingService } from '@/lib/api';
import type { SessionUser } from '@/lib/auth';
import type { Booking, BookingStatus } from '@/types';

const statusMeta: Record<BookingStatus, { label: string; description: string; style: string; icon: React.ReactNode }> = {
  Pending: {
    label: 'Menunggu Verifikasi',
    description: 'Pendaftaran sedang menunggu verifikasi admin.',
    style: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    icon: <Clock className="h-4 w-4" />,
  },
  Approved: {
    label: 'Diterima',
    description: 'Pendaftaran Anda telah disetujui.',
    style: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  Rejected: {
    label: 'Ditolak',
    description: 'Pendaftaran tidak disetujui oleh admin.',
    style: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    icon: <XCircle className="h-4 w-4" />,
  },
  Cancelled: {
    label: 'Dibatalkan',
    description: 'Pendaftaran ini sudah dibatalkan.',
    style: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    icon: <RotateCcw className="h-4 w-4" />,
  },
};

export default function UserDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const sessionResponse = await fetch('/api/auth/session', { cache: 'no-store' });
      const sessionData = await sessionResponse.json();

      if (!sessionData.authenticated || !sessionData.user) {
        setSession(null);
        router.replace('/login?from=/dashboard');
        return;
      }

      setSession(sessionData.user);
      setBookings(await BookingService.getMine());
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Dashboard belum dapat dimuat. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Dashboard menyinkronkan data server ketika halaman pertama kali dibuka.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const stats = useMemo(() => ({
    total: bookings.length,
    approved: bookings.filter((item) => item.status === 'Approved').length,
    pending: bookings.filter((item) => item.status === 'Pending').length,
    rejected: bookings.filter((item) => item.status === 'Rejected').length,
  }), [bookings]);

  const cancel = async (booking: Booking) => {
    setBusyId(booking.id);
    setError(null);
    try {
      const updated = await BookingService.cancel(booking.id);
      setBookings((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Pendaftaran belum dapat dibatalkan.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 ring-1 ring-inset ring-sky-500/30">
                <LayoutDashboard className="h-6 w-6 text-sky-400" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">Dashboard Saya</h1>
                <p className="mt-1 text-sm text-slate-300">Pantau status pendaftaran pelatihan Anda.</p>
              </div>
            </div>
            <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Muat Ulang
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-700 text-white">
              <User className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-900">{session?.fullName ?? 'Memuat profil…'}</h2>
              <p className="truncate text-sm text-slate-500">{session?.email ?? '-'}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400"><Building2 className="h-3.5 w-3.5" />{session?.department ?? '-'}</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-600">
              <Award className="h-4 w-4 text-sky-600" /> NIP: {session?.nip ?? '-'}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Pendaftaran" value={stats.total} icon={<GraduationCap />} accent="bg-slate-100 text-slate-700" />
          <StatCard label="Diterima" value={stats.approved} icon={<CheckCircle2 />} accent="bg-emerald-50 text-emerald-700" />
          <StatCard label="Menunggu" value={stats.pending} icon={<Clock />} accent="bg-amber-50 text-amber-700" />
          <StatCard label="Ditolak" value={stats.rejected} icon={<XCircle />} accent="bg-rose-50 text-rose-700" />
        </div>

        {error && <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><span>{error}</span></div>}

        <div className="mt-8">
          <h2 className="text-lg font-bold text-slate-900">Riwayat Pendaftaran</h2>
          <p className="mt-1 text-sm text-slate-500">Data pendaftaran terbaru dari akun Anda.</p>

          {loading ? (
            <div className="mt-4 grid min-h-52 place-items-center rounded-2xl border border-slate-200 bg-white"><Loader2 className="h-7 w-7 animate-spin text-sky-600" /></div>
          ) : bookings.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100"><GraduationCap className="h-7 w-7 text-slate-400" /></span>
              <h3 className="mt-4 font-semibold text-slate-900">Belum Ada Pendaftaran</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">Jelajahi katalog dan pilih program pelatihan yang sesuai.</p>
              <Link href="/trainings" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"><GraduationCap className="h-4 w-4" /> Lihat Katalog Pelatihan</Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {bookings.map((booking) => {
                const meta = statusMeta[booking.status];
                return (
                  <article key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400"><span className="rounded-full bg-sky-50 px-2.5 py-1 font-semibold text-sky-700">#{booking.id}</span><span>Didaftarkan {formatDate(booking.createdAt)}</span></div>
                        <h3 className="mt-3 text-base font-bold text-slate-900">{booking.trainingTitle}</h3>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500"><CalendarDays className="h-4 w-4" /> {booking.department}</p>
                      </div>
                      <div className="flex max-w-sm flex-col items-end gap-2 text-right">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${meta.style}`}>{meta.icon}{meta.label}</span>
                        <p className="text-xs text-slate-500">{meta.description}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                      <Link href={`/trainings/${booking.trainingId}`} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Lihat Detail</Link>
                      {(booking.status === 'Pending' || booking.status === 'Approved') && <button type="button" disabled={busyId === booking.id} onClick={() => window.confirm('Batalkan pendaftaran ini?') && void cancel(booking)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">{busyId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Batalkan</button>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-sky-100 p-6">
          <div><h3 className="font-bold text-slate-900">Ingin mengikuti pelatihan lain?</h3><p className="mt-1 text-sm text-slate-600">Temukan program baru pada katalog pelatihan PTC.</p></div>
          <Link href="/trainings" className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"><GraduationCap className="h-4 w-4" /> Katalog Pelatihan</Link>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className={`flex h-10 w-10 items-center justify-center rounded-lg [&_svg]:h-5 [&_svg]:w-5 ${accent}`}>{icon}</span><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p><p className="text-sm text-slate-500">{label}</p></div>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
