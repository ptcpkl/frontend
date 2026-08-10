'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, CalendarDays, Loader2, MapPin, RotateCcw } from 'lucide-react';
import { ApiError, BookingService } from '@/lib/api';
import type { SessionUser } from '@/lib/auth';
import type { Booking, BookingStatus } from '@/types';

const statusStyle: Record<BookingStatus, string> = {
  Pending: 'border-amber-500 bg-amber-50 text-amber-800',
  Approved: 'border-emerald-600 bg-emerald-50 text-emerald-800',
  Rejected: 'border-[#d92d20] bg-red-50 text-[#b42318]',
  Cancelled: 'border-slate-400 bg-slate-100 text-slate-600',
};

export default function UserDashboardPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionResponse, bookingData] = await Promise.all([
        fetch('/api/auth/session', { cache: 'no-store' }).then((response) => response.json()),
        BookingService.getMine(),
      ]);
      setSession(sessionResponse.user ?? null);
      setBookings(bookingData);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Dashboard belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Data ini memang disinkronkan dari API saat halaman dibuka.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  const activeCount = useMemo(() => bookings.filter((item) => item.status === 'Pending' || item.status === 'Approved').length, [bookings]);

  const cancel = async (booking: Booking) => {
    setBusyId(booking.id);
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
    <main className="min-h-screen bg-[#f4f1e9]">
      <header className="border-b border-[#101b2d]/20 bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 sm:px-10 lg:grid-cols-[1fr_280px] lg:px-16">
          <div><p className="technical-label text-[#d92d20]">Employee workspace</p><h1 className="display-type mt-3 text-5xl sm:text-6xl">Perjalanan belajar {session?.fullName?.split(' ')[0] ?? 'Anda'}.</h1><p className="mt-4 text-sm text-slate-600">Pantau status persetujuan dan jadwal program yang sudah dipilih.</p></div>
          <div className="grid grid-cols-2 gap-px bg-[#101b2d]/20 text-center"><div className="bg-[#101b2d] p-6 text-white"><p className="font-mono text-4xl font-bold">{activeCount}</p><p className="mt-2 text-xs text-slate-400">Aktif</p></div><div className="bg-white p-6"><p className="font-mono text-4xl font-bold">{bookings.length}</p><p className="mt-2 text-xs text-slate-500">Total</p></div></div>
        </div>
      </header>

      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-10 lg:px-16">
        {error && <div className="mb-6 flex gap-3 border border-[#d92d20] bg-red-50 p-4 text-sm text-[#b42318]"><AlertTriangle className="h-5 w-5 shrink-0" />{error}</div>}
        {loading ? <div className="grid min-h-72 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#d92d20]" /></div> : bookings.length === 0 ? (
          <div className="grid-paper border border-[#101b2d]/20 bg-white px-6 py-24 text-center"><h2 className="display-type text-4xl">Belum ada program yang dipilih.</h2><p className="mt-3 text-sm text-slate-600">Katalog sudah siap untuk dijelajahi.</p><Link href="/trainings" className="mt-7 inline-flex items-center gap-2 bg-[#101b2d] px-5 py-3 text-sm font-black text-white">Buka katalog <ArrowUpRight className="h-4 w-4" /></Link></div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <article key={booking.id} className="grid border border-[#101b2d]/20 bg-white lg:grid-cols-[150px_1fr_190px]">
                <div className="border-b border-[#101b2d]/15 p-6 lg:border-b-0 lg:border-r"><p className="technical-label text-slate-400">Booking</p><p className="mt-2 font-mono text-2xl font-bold">#{String(booking.id).padStart(4, '0')}</p><span className={`mt-5 inline-flex border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${statusStyle[booking.status]}`}>{booking.status}</span></div>
                <div className="p-6"><p className="technical-label text-[#d92d20]">Program terdaftar</p><h2 className="display-type mt-2 text-3xl">{booking.trainingTitle}</h2><div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-600"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Didaftar {new Date(booking.createdAt).toLocaleDateString('id-ID')}</span><span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {booking.department}</span></div></div>
                <div className="flex flex-col justify-center gap-3 border-t border-[#101b2d]/15 p-6 lg:border-l lg:border-t-0"><Link href={`/trainings/${booking.trainingId}`} className="flex items-center justify-between border border-[#101b2d] px-4 py-3 text-sm font-black">Lihat program <ArrowUpRight className="h-4 w-4" /></Link>{(booking.status === 'Pending' || booking.status === 'Approved') && <button disabled={busyId === booking.id} onClick={() => window.confirm('Batalkan pendaftaran ini?') && cancel(booking)} className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-[#b42318] hover:bg-red-50 disabled:opacity-50">{busyId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Batalkan</button>}</div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
