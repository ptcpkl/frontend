'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, BookOpen, Check, Edit3, Loader2, Plus, RefreshCw, Search, Trash2, Users, X } from 'lucide-react';
import { ApiError, BookingService, DashboardService, TrainingService } from '@/lib/api';
import type { Booking, BookingStatus, DashboardSummary, Training, TrainingInput } from '@/types';

const statuses: Array<'All' | BookingStatus> = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];
const emptyTraining: TrainingInput = { title: '', category: '', description: '', syllabus: '', location: '', startDate: '', endDate: '', quota: 1, status: 'Open' };

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<'bookings' | 'trainings'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'All' | BookingStatus>('All');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<Training | 'new' | null>(null);
  const [trainingForm, setTrainingForm] = useState<TrainingInput>(emptyTraining);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [bookingData, trainingData, summaryData] = await Promise.all([BookingService.getAll(), TrainingService.getAll({ sort: 'startdate' }), DashboardService.getSummary()]);
      setBookings(bookingData); setTrainings(trainingData); setSummary(summaryData);
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Data admin belum dapat dimuat.'); }
    finally { setLoading(false); }
  }, []);

  // Data admin disinkronkan dari API saat halaman dibuka.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  const visibleBookings = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bookings.filter((item) => (status === 'All' || item.status === status) && (!needle || [item.fullName, item.nip, item.department, item.trainingTitle, item.email].some((value) => value.toLowerCase().includes(needle))));
  }, [bookings, query, status]);

  const visibleTrainings = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return trainings.filter((item) => !needle || [item.title, item.category, item.location, item.status].some((value) => value.toLowerCase().includes(needle)));
  }, [query, trainings]);

  const updateBooking = async (booking: Booking, next: 'Approved' | 'Rejected') => {
    setBusyId(booking.id); setError(null); setNotice(null);
    try { const updated = await BookingService.updateStatus(booking.id, next); setBookings((items) => items.map((item) => item.id === updated.id ? updated : item)); setSummary(await DashboardService.getSummary()); setNotice(`Pendaftaran ${booking.fullName} berhasil ${next === 'Approved' ? 'disetujui' : 'ditolak'}.`); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Status belum dapat diperbarui.'); }
    finally { setBusyId(null); }
  };

  const cancelBooking = async (booking: Booking) => {
    setBusyId(booking.id); setError(null); setNotice(null);
    try { const updated = await BookingService.cancel(booking.id); setBookings((items) => items.map((item) => item.id === updated.id ? updated : item)); setSummary(await DashboardService.getSummary()); setNotice('Pendaftaran berhasil dibatalkan.'); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Pendaftaran belum dapat dibatalkan.'); }
    finally { setBusyId(null); }
  };

  const openTrainingForm = (training?: Training) => {
    setError(null); setNotice(null);
    if (!training) { setEditing('new'); setTrainingForm(emptyTraining); return; }
    setEditing(training);
    setTrainingForm({ title: training.title, category: training.category, description: training.description, syllabus: training.syllabus, location: training.location, startDate: toLocalInput(training.startDate), endDate: toLocalInput(training.endDate), quota: training.quota, status: training.status });
  };

  const saveTraining = async (event: React.FormEvent) => {
    event.preventDefault(); setError(null); setNotice(null);
    if (!trainingForm.title.trim() || !trainingForm.category.trim() || !trainingForm.location.trim()) { setError('Judul, kategori, dan lokasi wajib diisi.'); return; }
    if (!trainingForm.startDate || !trainingForm.endDate || new Date(trainingForm.endDate) <= new Date(trainingForm.startDate)) { setError('Waktu selesai harus setelah waktu mulai.'); return; }
    setBusyId(editing === 'new' ? -1 : editing?.id ?? -1);
    const payload = { ...trainingForm, title: trainingForm.title.trim(), category: trainingForm.category.trim(), description: trainingForm.description.trim(), syllabus: trainingForm.syllabus.trim(), location: trainingForm.location.trim(), startDate: new Date(trainingForm.startDate).toISOString(), endDate: new Date(trainingForm.endDate).toISOString(), quota: Number(trainingForm.quota) };
    try {
      if (editing === 'new') { const created = await TrainingService.create(payload); setTrainings((items) => [...items, created]); setNotice('Pelatihan baru berhasil dibuat.'); }
      else if (editing) { const updated = await TrainingService.update(editing.id, payload); setTrainings((items) => items.map((item) => item.id === updated.id ? updated : item)); setNotice('Pelatihan berhasil diperbarui.'); }
      setEditing(null); setSummary(await DashboardService.getSummary());
    } catch (cause) { setError(cause instanceof ApiError ? cause.errors[0] ?? cause.message : 'Pelatihan belum dapat disimpan.'); }
    finally { setBusyId(null); }
  };

  const removeTraining = async (training: Training) => {
    if (!window.confirm(`Hapus pelatihan "${training.title}"?`)) return;
    setBusyId(training.id); setError(null); setNotice(null);
    try { await TrainingService.remove(training.id); setTrainings((items) => items.filter((item) => item.id !== training.id)); setNotice('Pelatihan berhasil dihapus.'); setSummary(await DashboardService.getSummary()); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Pelatihan belum dapat dihapus.'); }
    finally { setBusyId(null); }
  };

  const metrics = [['Program', summary?.totalTrainings ?? trainings.length], ['Pendaftaran', summary?.totalBookings ?? bookings.length], ['Menunggu', summary?.pendingBookings ?? 0], ['Disetujui', summary?.approvedBookings ?? 0]];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-wider text-sky-400">Dashboard Admin</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">Kelola Pelatihan PorTC</h1><p className="mt-2 text-sm text-slate-400">Persetujuan peserta dan katalog dalam satu halaman.</p></div><button type="button" onClick={() => void load()} disabled={loading} className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Sinkronkan</button></div></div></header>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div>
        {error && <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
        {notice && <div role="status" className="mt-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><Check className="h-5 w-5 shrink-0" />{notice}</div>}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2"><button type="button" onClick={() => { setTab('bookings'); setQuery(''); }} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'bookings' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Users className="h-4 w-4" /> Pendaftaran</button><button type="button" onClick={() => { setTab('trainings'); setQuery(''); }} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'trainings' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}><BookOpen className="h-4 w-4" /> Kelola Pelatihan</button></div>
            <div className="flex flex-col gap-3 sm:flex-row"><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari data..." className="rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-sky-500" /></label>{tab === 'bookings' ? <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">{statuses.map((item) => <option key={item}>{item}</option>)}</select> : <button type="button" onClick={() => openTrainingForm()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"><Plus className="h-4 w-4" /> Tambah Pelatihan</button>}</div>
          </div>

          {loading ? <div className="grid min-h-80 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-sky-600" /></div> : tab === 'bookings' ? <BookingTable rows={visibleBookings} busyId={busyId} update={updateBooking} cancel={cancelBooking} /> : <TrainingTable rows={visibleTrainings} busyId={busyId} edit={openTrainingForm} remove={removeTraining} />}
        </div>

        {editing && <TrainingEditor value={trainingForm} setValue={setTrainingForm} editing={editing} busy={busyId !== null} close={() => setEditing(null)} save={saveTraining} />}
      </section>
    </main>
  );
}

function BookingTable({ rows, busyId, update, cancel }: { rows: Booking[]; busyId: number | null; update: (booking: Booking, status: 'Approved' | 'Rejected') => Promise<void>; cancel: (booking: Booking) => Promise<void> }) {
  if (!rows.length) return <Empty text="Tidak ada pendaftaran yang cocok." />;
  return <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Karyawan', 'Program', 'Departemen', 'Tanggal', 'Status', 'Aksi'].map((head) => <th key={head} className="px-5 py-3.5 font-semibold">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((booking) => <tr key={booking.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold">{booking.fullName}</p><p className="text-xs text-slate-500">{booking.nip} · {booking.email}</p></td><td className="max-w-xs px-5 py-4 font-medium">{booking.trainingTitle}</td><td className="px-5 py-4 text-slate-600">{booking.department}</td><td className="px-5 py-4 text-slate-600">{new Date(booking.createdAt).toLocaleDateString('id-ID')}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{booking.status}</span></td><td className="px-5 py-4"><div className="flex gap-2"><Action title="Setujui" disabled={busyId === booking.id || booking.status === 'Approved' || booking.status === 'Cancelled'} onClick={() => void update(booking, 'Approved')} className="bg-emerald-600"><Check /></Action><Action title="Tolak" disabled={busyId === booking.id || booking.status === 'Rejected' || booking.status === 'Cancelled'} onClick={() => void update(booking, 'Rejected')} className="bg-rose-600"><X /></Action><button type="button" disabled={busyId === booking.id || booking.status === 'Cancelled'} onClick={() => window.confirm('Batalkan pendaftaran ini?') && void cancel(booking)} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30">Batalkan</button></div></td></tr>)}</tbody></table></div>;
}

function TrainingTable({ rows, busyId, edit, remove }: { rows: Training[]; busyId: number | null; edit: (training: Training) => void; remove: (training: Training) => Promise<void> }) {
  if (!rows.length) return <Empty text="Tidak ada pelatihan yang cocok." />;
  return <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Pelatihan', 'Jadwal', 'Lokasi', 'Kursi', 'Status', 'Aksi'].map((head) => <th key={head} className="px-5 py-3.5 font-semibold">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((training) => <tr key={training.id} className="hover:bg-slate-50"><td className="max-w-sm px-5 py-4"><p className="font-semibold">{training.title}</p><p className="text-xs text-sky-600">{training.category}</p></td><td className="px-5 py-4 text-slate-600">{new Date(training.startDate).toLocaleDateString('id-ID')}</td><td className="px-5 py-4 text-slate-600">{training.location}</td><td className="px-5 py-4">{training.availableSeats}/{training.quota}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{training.status}</span></td><td className="px-5 py-4"><div className="flex gap-2"><button type="button" onClick={() => edit(training)} className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"><Edit3 className="h-3.5 w-3.5" /> Edit</button><button type="button" disabled={busyId === training.id} onClick={() => void remove(training)} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /> Hapus</button></div></td></tr>)}</tbody></table></div>;
}

function TrainingEditor({ value, setValue, editing, busy, close, save }: { value: TrainingInput; setValue: React.Dispatch<React.SetStateAction<TrainingInput>>; editing: Training | 'new'; busy: boolean; close: () => void; save: (event: React.FormEvent) => Promise<void> }) {
  const update = (field: keyof TrainingInput) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValue((current) => ({ ...current, [field]: field === 'quota' ? Number(event.target.value) : event.target.value }));
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 p-4"><section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-sky-600">Kelola Katalog</p><h2 className="mt-1 text-2xl font-bold">{editing === 'new' ? 'Tambah Pelatihan' : 'Edit Pelatihan'}</h2></div><button type="button" onClick={close} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2"><EditorField label="Judul" className="sm:col-span-2"><input value={value.title} onChange={update('title')} /></EditorField><EditorField label="Kategori"><input value={value.category} onChange={update('category')} /></EditorField><EditorField label="Lokasi"><input value={value.location} onChange={update('location')} /></EditorField><EditorField label="Mulai"><input type="datetime-local" value={value.startDate} onChange={update('startDate')} /></EditorField><EditorField label="Selesai"><input type="datetime-local" value={value.endDate} onChange={update('endDate')} /></EditorField><EditorField label="Kuota"><input type="number" min="1" value={value.quota} onChange={update('quota')} /></EditorField><EditorField label="Status"><select value={value.status} onChange={update('status')}><option>Open</option><option>Closed</option><option>Draft</option></select></EditorField><EditorField label="Deskripsi" className="sm:col-span-2"><textarea rows={4} value={value.description} onChange={update('description')} /></EditorField><EditorField label="Silabus (satu materi per baris)" className="sm:col-span-2"><textarea rows={6} value={value.syllabus} onChange={update('syllabus')} /></EditorField><div className="mt-2 flex justify-end gap-3 sm:col-span-2"><button type="button" onClick={close} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold">Batal</button><button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Simpan</button></div></form></section></div>;
}

function EditorField({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) { return <label className={`block ${className}`}><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span><span className="block [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:outline-none [&_input]:focus:border-sky-500 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-2.5 [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:px-3.5 [&_textarea]:py-2.5 [&_textarea]:outline-none [&_textarea]:focus:border-sky-500">{children}</span></label>; }
function Action({ title, disabled, onClick, className, children }: { title: string; disabled: boolean; onClick: () => void; className: string; children: React.ReactNode }) { return <button type="button" title={title} disabled={disabled} onClick={onClick} className={`grid h-9 w-9 place-items-center rounded-lg text-white disabled:opacity-30 [&_svg]:h-4 [&_svg]:w-4 ${className}`}>{children}</button>; }
function Empty({ text }: { text: string }) { return <div className="py-20 text-center text-sm text-slate-500">{text}</div>; }
function toLocalInput(value: string) { const date = new Date(value); const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 16); }
