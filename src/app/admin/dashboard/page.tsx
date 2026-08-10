'use client'; 

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Users,
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
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | BookingStatus>('All');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BookingService.getAll();
      setBookings(data);
    } catch {
      setError('Gagal memuat data booking. Pastikan backend .NET Web API sudah berjalan, lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesQuery =
        !normalized ||
        booking.employeeName.toLowerCase().includes(normalized) ||
        booking.nip.toLowerCase().includes(normalized) ||
        booking.department.toLowerCase().includes(normalized) ||
        (booking.trainingTitle ?? '').toLowerCase().includes(normalized) ||
        booking.email.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [bookings, query, statusFilter]);

  const handleUpdateStatus = async (booking: Booking, status: 'Approved' | 'Rejected') => {
    setActionLoadingId(booking.id);
    setError(null);

    const previousStatus = booking.status;
    setBookings((prev) =>
      prev.map((item) => (item.id === booking.id ? { ...item, status } : item)),
    );

    try {
      const updated = await BookingService.updateStatus(booking.id, status);
      setBookings((prev) =>
        prev.map((item) => (item.id === booking.id ? { ...item, ...updated } : item)),
      );
    } catch {
      setBookings((prev) =>
        prev.map((item) => (item.id === booking.id ? { ...item, status: previousStatus } : item)),
      );
      setError('Gagal memperbarui status booking. Coba lagi.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setActionLoadingId(id);
    setError(null);

    setBookings((prev) => prev.filter((item) => item.id !== id));

    try {
      await BookingService.delete(id);
    } catch {
      setError('Gagal menghapus booking. Data akan dimuat ulang.');
      fetchBookings();
    } finally {
      setActionLoadingId(null);
    }
  };

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'Pending').length,
      approved: bookings.filter((b) => b.status === 'Approved').length,
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
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Dashboard Admin PTC</h1>
              <p className="mt-1 text-sm text-slate-300">
                Kelola pendaftaran pelatihan & verifikasi peserta.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Pendaftar" value={stats.total} icon={<Users className="h-5 w-5" />} accent="text-slate-900 bg-slate-100" />
          <StatCard label="Total Approved" value={stats.approved} icon={<CheckCircle2 className="h-5 w-5" />} accent="text-emerald-700 bg-emerald-50" />
          <StatCard label="Total Pending" value={stats.pending} icon={<ClockIcon />} accent="text-amber-700 bg-amber-50" />
          <StatCard label="Total Rejected" value={stats.rejected} icon={<XCircle className="h-5 w-5" />} accent="text-rose-700 bg-rose-50" />
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama, NIP, departemen, pelatihan..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'All' | BookingStatus)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="All">Semua Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <button
                type="button"
                onClick={fetchBookings}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Muat Ulang
              </button>
            </div>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : filteredBookings.length === 0 ? (
            <EmptyTable hasFilters={query.trim().length > 0 || statusFilter !== 'All'} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3.5 font-semibold">ID</th>
                    <th className="px-4 py-3.5 font-semibold">Nama Karyawan</th>
                    <th className="px-4 py-3.5 font-semibold">NIP</th>
                    <th className="px-4 py-3.5 font-semibold">Departemen</th>
                    <th className="px-4 py-3.5 font-semibold">Pelatihan</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-4 py-3.5 font-semibold">Tanggal Daftar</th>
                    <th className="px-4 py-3.5 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-4 font-mono text-xs text-slate-400">#{booking.id}</td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{booking.employeeName}</div>
                        <div className="text-xs text-slate-400">{booking.email}</div>
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-600">{booking.nip}</td>
                      <td className="px-4 py-4 text-slate-600">{booking.department}</td>
                      <td className="px-4 py-4 text-slate-600">{booking.trainingTitle ?? `Pelatihan #${booking.trainingId}`}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[booking.status]}`}
                        >
                          {STATUS_LABELS[booking.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{formatDate(booking.createdAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={actionLoadingId === booking.id || booking.status === 'Approved'}
                            onClick={() => handleUpdateStatus(booking, 'Approved')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={actionLoadingId === booking.id || booking.status === 'Rejected'}
                            onClick={() => handleUpdateStatus(booking, 'Rejected')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Reject
                          </button>
                          <button
                            type="button"
                            disabled={actionLoadingId === booking.id}
                            onClick={() => {
                              if (window.confirm(`Hapus booking "${booking.employeeName}"?`)) {
                                handleDelete(booking.id);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {actionLoadingId === booking.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500">
            Menampilkan {filteredBookings.length} dari {bookings.length} booking
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

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3.5 font-semibold">ID</th>
            <th className="px-4 py-3.5 font-semibold">Nama Karyawan</th>
            <th className="px-4 py-3.5 font-semibold">NIP</th>
            <th className="px-4 py-3.5 font-semibold">Departemen</th>
            <th className="px-4 py-3.5 font-semibold">Pelatihan</th>
            <th className="px-4 py-3.5 font-semibold">Status</th>
            <th className="px-4 py-3.5 font-semibold">Tanggal Daftar</th>
            <th className="px-4 py-3.5 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-4 py-4">
                <div className="h-4 w-8 rounded bg-slate-200" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-44 rounded bg-slate-100" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-20 rounded bg-slate-200" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-24 rounded bg-slate-200" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-40 rounded bg-slate-200" />
              </td>
              <td className="px-4 py-4">
                <div className="h-6 w-20 rounded-full bg-slate-200" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-24 rounded bg-slate-200" />
              </td>
              <td className="px-4 py-4">
                <div className="flex justify-end gap-2">
                  <div className="h-7 w-20 rounded-lg bg-slate-200" />
                  <div className="h-7 w-16 rounded-lg bg-slate-200" />
                  <div className="h-7 w-16 rounded-lg bg-slate-200" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyTable({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <Users className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        {hasFilters ? 'Tidak ada data yang cocok' : 'Belum ada booking'}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {hasFilters
          ? 'Coba ubah kata kunci pencarian atau filter status.'
          : 'Pendaftaran pelatihan dari karyawan akan tampil di sini.'}
      </p>
    </div>
  );
}