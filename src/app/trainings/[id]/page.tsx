'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CalendarDays, CheckCircle2, Clock, LayoutDashboard, Loader2, Mail, MapPin, ShieldCheck, User, Users } from 'lucide-react';
import { ApiError, BookingService, TrainingService } from '@/lib/api';
import type { SessionUser } from '@/lib/auth';
import type { Training } from '@/types';

export default function TrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [training, setTraining] = useState<Training | null>(null);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    Promise.all([
      TrainingService.getById(id),
      fetch('/api/auth/session', { cache: 'no-store' }).then((response) => response.json()),
    ]).then(([trainingData, sessionData]) => {
      setTraining(trainingData);
      setSession(sessionData.authenticated ? sessionData.user : null);
    }).catch((cause) => setFeedback({ type: 'error', message: cause instanceof ApiError ? cause.message : 'Detail pelatihan gagal dimuat.' })).finally(() => setLoading(false));
  }, [id]);

  const syllabus = useMemo(() => training?.syllabus.split(/\r?\n/).map((line) => line.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean) ?? [], [training]);

  const enroll = async () => {
    if (!session) {
      router.push(`/login?from=${encodeURIComponent(`/trainings/${id}`)}`);
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      await BookingService.create({ trainingId: Number(id) });
      setFeedback({ type: 'success', message: 'Pendaftaran berhasil dikirim. Pantau statusnya melalui dashboard Anda.' });
      setTraining(await TrainingService.getById(id));
    } catch (cause) {
      setFeedback({ type: 'error', message: cause instanceof ApiError ? cause.message : 'Pendaftaran belum dapat diproses.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="grid min-h-[70vh] place-items-center bg-slate-50"><Loader2 className="h-7 w-7 animate-spin text-sky-600" /></main>;
  if (!training) return <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-4"><div className="text-center"><AlertCircle className="mx-auto h-10 w-10 text-rose-600" /><h1 className="mt-4 text-2xl font-bold">Pelatihan tidak ditemukan</h1><Link href="/trainings" className="mt-5 inline-block text-sm font-semibold text-sky-600">Kembali ke katalog</Link></div></main>;

  const days = Math.max(1, Math.ceil((new Date(training.endDate).getTime() - new Date(training.startDate).getTime()) / 86400000));
  const canEnroll = training.status.toLowerCase() === 'open' && training.availableSeats > 0;
  const date = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(training.startDate));

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link href="/trainings" className="inline-flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300"><ArrowLeft className="h-4 w-4" /> Kembali ke Katalog</Link>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-4xl"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300 ring-1 ring-sky-500/30">{training.category}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${canEnroll ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30' : 'bg-rose-500/15 text-rose-300 ring-rose-500/30'}`}>{canEnroll ? `${training.availableSeats} kursi tersedia` : 'Pendaftaran ditutup'}</span></div><h1 className="mt-4 text-3xl font-bold sm:text-4xl">{training.title}</h1><p className="mt-4 max-w-3xl leading-7 text-slate-300">{training.description}</p></div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="space-y-6 lg:col-span-3">
          <Card><h2 className="text-lg font-bold">Silabus Pelatihan</h2><ol className="mt-5 space-y-3">{syllabus.length ? syllabus.map((item, index) => <li key={`${item}-${index}`} className="flex items-start gap-3 text-sm leading-6 text-slate-600"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">{index + 1}</span>{item}</li>) : <li className="text-sm text-slate-500">Silabus akan diumumkan kemudian.</li>}</ol></Card>
          <Card><h2 className="text-lg font-bold">Informasi Pelatihan</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Info icon={<CalendarDays />} label="Tanggal mulai" value={date} /><Info icon={<Clock />} label="Durasi" value={`${days} hari`} /><Info icon={<MapPin />} label="Lokasi" value={training.location} /><Info icon={<Users />} label="Ketersediaan" value={`${training.availableSeats} dari ${training.quota} kursi`} /></div></Card>
        </div>

        <aside className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-bold">Pendaftaran Pelatihan</h2><p className="mt-2 text-sm leading-6 text-slate-500">Data pendaftar diambil dari profil akun agar identitas tidak dapat tertukar.</p>
            {session ? <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="flex items-center gap-2 font-semibold"><User className="h-4 w-4 text-sky-600" />{session.fullName}</p><p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Mail className="h-4 w-4" />{session.email}</p><p className="mt-1 text-xs text-slate-500">NIP {session.nip} · {session.department}</p></div> : <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Silakan login sebelum mendaftar.</div>}
            {feedback && <div role="alert" className={`mt-5 flex gap-3 rounded-xl border p-4 text-sm ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{feedback.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}{feedback.message}</div>}
            <button type="button" onClick={enroll} disabled={!canEnroll || submitting || feedback?.type === 'success'} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}{!canEnroll ? 'Pendaftaran Ditutup' : session ? 'Daftar Sekarang' : 'Login untuk Mendaftar'}</button>
            {feedback?.type === 'success' && <Link href="/dashboard" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><LayoutDashboard className="h-4 w-4" /> Lihat Dashboard Saya</Link>}
            <p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Satu akun hanya dapat memiliki satu pendaftaran aktif untuk program yang sama.</p>
          </Card>
        </aside>
      </section>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) { return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">{children}</div>; }
function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 [&_svg]:h-5 [&_svg]:w-5">{icon}</span><div><p className="text-xs uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div></div>; }
