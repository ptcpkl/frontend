'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { ApiError, BookingService, DashboardService } from '@/lib/api';
import type { Booking, BookingStatus, DashboardSummary } from '@/types';

const statuses: Array<'All' | BookingStatus> = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'All' | BookingStatus>('All');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookingData, summaryData] = await Promise.all([BookingService.getAll(), DashboardService.getSummary()]);
      setBookings(bookingData); setSummary(summaryData);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Data operasional belum dapat dimuat.');
    } finally { setLoading(false); }
  }, []);
  // Data ini memang disinkronkan dari API saat halaman dibuka.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bookings.filter((item) => (status === 'All' || item.status === status) && (!needle || [item.fullName, item.nip, item.department, item.trainingTitle, item.email].some((value) => value.toLowerCase().includes(needle))));
  }, [bookings, query, status]);

  const update = async (booking: Booking, next: 'Approved' | 'Rejected') => {
    setBusyId(booking.id); setError(null);
    try { const updated = await BookingService.updateStatus(booking.id, next); setBookings((items) => items.map((item) => item.id === updated.id ? updated : item)); await refreshSummary(); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Status belum dapat diperbarui.'); }
    finally { setBusyId(null); }
  };

  const cancel = async (booking: Booking) => {
    setBusyId(booking.id); setError(null);
    try { const updated = await BookingService.cancel(booking.id); setBookings((items) => items.map((item) => item.id === updated.id ? updated : item)); await refreshSummary(); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Pendaftaran belum dapat dibatalkan.'); }
    finally { setBusyId(null); }
  };

  const refreshSummary = async () => setSummary(await DashboardService.getSummary());
  const metrics = [
    ['Programs', summary?.totalTrainings ?? 0],
    ['Applications', summary?.totalBookings ?? bookings.length],
    ['Pending', summary?.pendingBookings ?? bookings.filter((b) => b.status === 'Pending').length],
    ['Approved', summary?.approvedBookings ?? bookings.filter((b) => b.status === 'Approved').length],
  ];

  return (
    <main className="min-h-screen bg-[#f4f1e9]">
      <header className="bg-[#101b2d] text-white"><div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-10 lg:px-16"><p className="technical-label text-[#ff6b5f]">Operations console / admin</p><div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><h1 className="display-type text-5xl sm:text-6xl">Enrollment control room.</h1><button onClick={load} className="inline-flex w-fit items-center gap-2 border border-white/30 px-4 py-3 text-sm font-bold hover:bg-white hover:text-[#101b2d]"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Sinkronkan</button></div></div></header>
      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-10 lg:px-16">
        <div className="grid gap-px bg-[#101b2d]/20 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="bg-white p-6"><p className="technical-label text-slate-500">{label}</p><p className="mt-3 font-mono text-4xl font-bold">{value}</p></div>)}</div>
        {error && <div className="mt-6 flex gap-3 border border-[#d92d20] bg-red-50 p-4 text-sm text-[#b42318]"><AlertTriangle className="h-5 w-5 shrink-0" />{error}</div>}
        <div className="mt-8 border border-[#101b2d]/20 bg-white">
          <div className="grid gap-3 border-b border-[#101b2d]/20 p-4 md:grid-cols-[1fr_220px]"><label className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, NIP, departemen, program…" className="w-full border border-[#101b2d]/30 py-3 pl-11 pr-4 outline-none focus:border-[#d92d20]" /></label><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="border border-[#101b2d]/30 bg-white px-4 py-3 font-bold outline-none">{statuses.map((item) => <option key={item}>{item}</option>)}</select></div>
          {loading ? <div className="grid min-h-80 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#d92d20]" /></div> : visible.length === 0 ? <div className="py-24 text-center"><p className="display-type text-3xl">Tidak ada data yang cocok.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-[#101b2d] text-white"><tr>{['Karyawan','Program','Departemen','Dikirim','Status','Keputusan'].map((head) => <th key={head} className="px-5 py-4 technical-label text-slate-300">{head}</th>)}</tr></thead><tbody className="divide-y divide-[#101b2d]/10">{visible.map((booking) => <tr key={booking.id} className="align-top hover:bg-[#f4f1e9]"><td className="px-5 py-5"><p className="font-black">{booking.fullName}</p><p className="mt-1 font-mono text-xs text-slate-500">{booking.nip}</p><p className="text-xs text-slate-500">{booking.email}</p></td><td className="max-w-xs px-5 py-5 font-semibold">{booking.trainingTitle}</td><td className="px-5 py-5 text-slate-600">{booking.department}</td><td className="px-5 py-5 text-slate-600">{new Date(booking.createdAt).toLocaleDateString('id-ID')}</td><td className="px-5 py-5"><span className="border border-[#101b2d]/30 px-2 py-1 text-[10px] font-black uppercase tracking-wider">{booking.status}</span></td><td className="px-5 py-5"><div className="flex gap-2"><button title="Setujui" disabled={busyId === booking.id || booking.status === 'Approved' || booking.status === 'Cancelled'} onClick={() => update(booking,'Approved')} className="grid h-9 w-9 place-items-center bg-emerald-600 text-white disabled:opacity-30"><Check className="h-4 w-4" /></button><button title="Tolak" disabled={busyId === booking.id || booking.status === 'Rejected' || booking.status === 'Cancelled'} onClick={() => update(booking,'Rejected')} className="grid h-9 w-9 place-items-center bg-[#d92d20] text-white disabled:opacity-30"><X className="h-4 w-4" /></button><button title="Batalkan" disabled={busyId === booking.id || booking.status === 'Cancelled'} onClick={() => window.confirm('Batalkan pendaftaran ini?') && cancel(booking)} className="px-3 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30">Cancel</button></div></td></tr>)}</tbody></table></div>}
          <div className="border-t border-[#101b2d]/20 px-5 py-3 font-mono text-xs text-slate-500">{visible.length} / {bookings.length} records</div>
        </div>
      </section>
    </main>
  );
}
