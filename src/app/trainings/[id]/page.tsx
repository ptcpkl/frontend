'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      TrainingService.getById(id),
      fetch('/api/auth/session', { cache: 'no-store' }).then((response) => response.json()),
    ])
      .then(([trainingData, sessionData]) => {
        setTraining(trainingData);
        setSession(sessionData.authenticated ? sessionData.user : null);
      })
      .catch((cause) =>
        setMessage({
          type: 'error',
          text: cause instanceof ApiError ? cause.message : 'Detail pelatihan belum dapat dimuat.',
        }),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const syllabus = useMemo(
    () => training?.syllabus.split(/\r?\n/).map((line) => line.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean) ?? [],
    [training],
  );

  const handleEnroll = async () => {
    if (!session) {
      router.push(`/login?from=${encodeURIComponent(`/trainings/${id}`)}`);
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await BookingService.create({ trainingId: Number(id) });
      setMessage({ type: 'success', text: 'Pendaftaran terkirim. Statusnya dapat dipantau di dashboard.' });
      const refreshed = await TrainingService.getById(id);
      setTraining(refreshed);
    } catch (cause) {
      setMessage({
        type: 'error',
        text: cause instanceof ApiError ? cause.message : 'Pendaftaran belum dapat diproses.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="grid min-h-[70vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#d92d20]" /></div>;
  }

  if (!training) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-24 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-[#d92d20]" />
        <h1 className="display-type mt-4 text-4xl">Pelatihan tidak ditemukan.</h1>
        <Link href="/trainings" className="mt-6 inline-block font-bold text-[#d92d20]">Kembali ke katalog</Link>
      </main>
    );
  }

  const duration = Math.max(1, Math.ceil((new Date(training.endDate).getTime() - new Date(training.startDate).getTime()) / 86400000));
  const canEnroll = training.status.toLowerCase() === 'open' && training.availableSeats > 0;

  return (
    <main className="min-h-screen bg-[#f4f1e9]">
      <section className="border-b border-[#101b2d]/20 bg-[#101b2d] text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-10 lg:px-16 lg:py-16">
          <Link href="/trainings" className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Katalog
          </Link>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <p className="technical-label text-[#ff6b5f]">{training.category} / PTC-{String(training.id).padStart(3, '0')}</p>
              <h1 className="display-type mt-5 max-w-5xl text-5xl leading-[0.95] sm:text-7xl">{training.title}</h1>
              <p className="mt-8 max-w-3xl text-base leading-7 text-slate-300">{training.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-px self-end bg-white/20">
              <Metric icon={CalendarDays} label="Mulai" value={new Date(training.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })} />
              <Metric icon={Clock3} label="Durasi" value={`${duration} hari`} />
              <Metric icon={MapPin} label="Lokasi" value={training.location} />
              <Metric icon={Users} label="Tersedia" value={`${training.availableSeats}/${training.quota}`} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-10 lg:grid-cols-[1fr_380px] lg:px-16 lg:py-16">
        <article className="bg-white p-7 sm:p-10">
          <p className="technical-label text-[#d92d20]">Learning outline</p>
          <h2 className="display-type mt-3 text-4xl">Apa yang akan dipelajari</h2>
          <ol className="mt-9 divide-y divide-[#101b2d]/15 border-y border-[#101b2d]/15">
            {syllabus.map((item, index) => (
              <li key={`${item}-${index}`} className="grid grid-cols-[46px_1fr] gap-4 py-5">
                <span className="font-mono text-sm font-bold text-[#d92d20]">{String(index + 1).padStart(2, '0')}</span>
                <span className="font-semibold leading-6">{item}</span>
              </li>
            ))}
          </ol>
        </article>

        <aside className="h-fit border-t-4 border-[#d92d20] bg-white p-7 lg:sticky lg:top-24">
          <p className="technical-label text-slate-500">Enrollment desk</p>
          <h2 className="display-type mt-3 text-3xl">Amankan kursi Anda</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Data nama, NIP, departemen, dan email diambil langsung dari profil akun untuk mencegah kesalahan identitas.
          </p>

          {session && (
            <div className="mt-6 border border-[#101b2d]/15 bg-[#f4f1e9] p-4 text-sm">
              <p className="font-black">{session.fullName}</p>
              <p className="mt-1 text-xs text-slate-600">{session.nip} · {session.department}</p>
            </div>
          )}

          {message && (
            <div className={`mt-5 flex gap-3 border p-4 text-sm ${message.type === 'success' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-[#d92d20] bg-red-50 text-[#b42318]'}`}>
              {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleEnroll}
            disabled={!canEnroll || submitting || message?.type === 'success'}
            className="mt-6 flex w-full items-center justify-center gap-2 bg-[#d92d20] px-5 py-4 text-sm font-black text-white hover:bg-[#101b2d] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {!canEnroll ? 'Pendaftaran ditutup' : session ? 'Kirim pendaftaran' : 'Masuk untuk mendaftar'}
          </button>
          <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            Satu akun hanya dapat memiliki satu pendaftaran aktif untuk program yang sama.
          </div>
        </aside>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="bg-[#101b2d] p-5">
      <Icon className="h-4 w-4 text-[#ff6b5f]" />
      <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
