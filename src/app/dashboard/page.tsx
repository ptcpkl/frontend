'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CalendarDays, CheckCircle2, ChevronRight, GraduationCap, Loader2, RefreshCw, RotateCcw, User } from 'lucide-react';
import { ApiError, BookingService } from '@/lib/api';
import type { SessionUser } from '@/lib/auth';
import type { Booking, BookingStatus } from '@/types';

const statusStyle: Record<BookingStatus, string> = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  Cancelled: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export default function UserDashboardPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [sessionResponse, bookingData] = await Promise.all([fetch('/api/auth/session', { cache: 'no-store' }).then((response) => response.json()), BookingService.getMine()]);
      setSession(sessionResponse.user ?? null); setBookings(bookingData);
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Dashboard belum dapat dimuat.'); }
    finally { setLoading(false); }
  }, []);

  // Data dashboard disinkronkan dari API saat halaman dibuka.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);
  const active = useMemo(() => bookings.filter((item) => item.status === 'Pending' || item.status === 'Approved').length, [bookings]);

  const cancel = async (booking: Booking) => {
    setBusyId(booking.id); setError(null);
    try { const updated = await BookingService.cancel(booking.id); setBookings((current) => current.map((item) => item.id === updated.id ? updated : item)); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Pendaftaran belum dapat dibatalkan.'); }
    finally { setBusyId(null); }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-wider text-sky-400">Dashboard Karyawan</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">Halo, {session?.fullName?.split(' ')[0] ?? 'Karyawan'}!</h1><p className="mt-2 text-sm text-slate-400">Pantau seluruh pendaftaran dan status persetujuan Anda.</p></div><button type="button" onClick={() => void load()} disabled={loading} className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Muat Ulang</button></div></div></header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-3"><Stat icon={<GraduationCap />} label="Total pendaftaran" value={bookings.length} /><Stat icon={<CheckCircle2 />} label="Pendaftaran aktif" value={active} /><Stat icon={<User />} label="NIP" value={session?.nip ?? '-'} small /></div>
        {error && <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5"><h2 className="text-lg font-bold">Pendaftaran Saya</h2><p className="mt-1 text-sm text-slate-500">Data terbaru langsung dari backend pelatihan.</p></div>
          {loading ? <div className="grid min-h-72 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-sky-600" /></div> : bookings.length === 0 ? <div className="px-6 py-16 text-center"><GraduationCap className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-4 font-semibold">Belum ada pendaftaran</h3><p className="mt-1 text-sm text-slate-500">Pilih program yang sesuai dari katalog.</p><Link href="/trainings" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">Buka Katalog <ChevronRight className="h-4 w-4" /></Link></div> : <div className="divide-y divide-slate-100">{bookings.map((booking) => <article key={booking.id} className="grid gap-5 p-6 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle[booking.status]}`}>{booking.status}</span><span className="text-xs text-slate-400">Booking #{booking.id}</span></div><h3 className="mt-3 text-lg font-bold">{booking.trainingTitle}</h3><p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><CalendarDays className="h-4 w-4 text-sky-600" /> Didaftarkan {new Date(booking.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div><div className="flex flex-wrap gap-2"><Link href={`/trainings/${booking.trainingId}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Lihat Detail <ChevronRight className="h-4 w-4" /></Link>{(booking.status === 'Pending' || booking.status === 'Approved') && <button type="button" disabled={busyId === booking.id} onClick={() => window.confirm('Batalkan pendaftaran ini?') && void cancel(booking)} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">{busyId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Batalkan</button>}</div></article>)}</div>}
        </div>
      </section>
    </main>
  );
}

function Stat({ icon, label, value, small = false }: { icon: React.ReactNode; label: string; value: number | string; small?: boolean }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 [&_svg]:h-5 [&_svg]:w-5">{icon}</span><p className={`mt-3 font-bold ${small ? 'text-xl' : 'text-3xl'}`}>{value}</p><p className="text-sm text-slate-500">{label}</p></div>; }
