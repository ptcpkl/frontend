'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Loader2,
  Mail,
  MapPin,
  RefreshCw,
  User,
  Users,
} from 'lucide-react';
import { BookingService, TrainingService } from '@/lib/api';
import { DEPARTMENTS } from '@/lib/auth';
import type { Training } from '@/types';

interface FormState {
  employeeName: string;
  nip: string;
  department: string;
  email: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  employeeName: '',
  nip: '',
  department: '',
  email: '',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function validateForm(values: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!values.employeeName.trim()) {
    errors.employeeName = 'Nama lengkap wajib diisi.';
  } else if (values.employeeName.trim().length < 3) {
    errors.employeeName = 'Nama lengkap minimal 3 karakter.';
  }

  if (!values.nip.trim()) {
    errors.nip = 'NIP wajib diisi.';
  } else if (!/^\d{6,20}$/.test(values.nip.trim())) {
    errors.nip = 'NIP harus berupa angka 6–20 digit.';
  }

  if (!values.department.trim()) {
    errors.department = 'Departemen wajib diisi.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email wajib diisi.';
  } else if (!/^[a-zA-Z0-9._%+-]+@pertamina\.com$/.test(values.email.trim())) {
    errors.email = 'Gunakan email Pertamina (@pertamina.com).';
  }

  return errors;
}

export default function TrainingDetailPage() {
  const params = useParams<{ id: string }>();
  const trainingId = params.id;

  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const fetchTraining = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TrainingService.getById(trainingId);
      setTraining(data);
    } catch {
      setError('Gagal memuat detail pelatihan. Pastikan backend .NET Web API sudah berjalan, lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [trainingId]);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (data.authenticated && data.user) {
        setForm((prev) => ({
          ...prev,
          employeeName: data.user.name ?? prev.employeeName,
          nip: data.user.nip ?? prev.nip,
          department: data.user.department ?? prev.department,
          email: data.user.email ?? prev.email,
        }));
      }
    } finally {
      setSessionLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchTraining();
    fetchSession();
  }, [fetchTraining, fetchSession]);

  const handleChange = (field: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await BookingService.create({
        trainingId: Number(trainingId),
        employeeName: form.employeeName.trim(),
        nip: form.nip.trim(),
        department: form.department.trim(),
        email: form.email.trim(),
      });
      setFeedback({
        type: 'success',
        message: 'Pendaftaran berhasil! Silakan pilih navigasi berikutnya.',
      });
    } catch {
      setFeedback({
        type: 'error',
        message: 'Pendaftaran gagal. Periksa kembali data Anda atau coba beberapa saat lagi.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !training) {
    return <DetailError message={error ?? 'Pelatihan tidak ditemukan.'} onRetry={fetchTraining} />;
  }

  const isFull = training.availableSeats <= 0;
  const syllabusItems = training.syllabus
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/trainings"
            className="inline-flex items-center gap-2 text-sm font-medium text-sky-400 transition hover:text-sky-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Katalog
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300 ring-1 ring-inset ring-sky-500/30">
                  {training.category}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                    isFull
                      ? 'bg-rose-500/15 text-rose-300 ring-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  {isFull ? 'Kuota Penuh' : `${training.availableSeats} dari ${training.quota} kursi tersedia`}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{training.title}</h1>
            </div>
          </div>
        </div>
      </header>

      {feedback && (
        <div
          className={`mx-auto mt-6 flex max-w-7xl items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {feedback?.type === 'success' && (
        <div className="mx-auto mt-4 flex max-w-7xl flex-wrap gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/trainings"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Katalog
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <LayoutDashboard className="h-4 w-4" />
            Lihat Dashboard Saya
          </Link>
        </div>
      )}

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="space-y-6 lg:col-span-3">
          <Card>
            <h2 className="text-lg font-bold text-slate-900">Deskripsi</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {training.description}
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-slate-900">Silabus Pelatihan</h2>
            {syllabusItems.length > 0 ? (
              <ol className="mt-4 space-y-3">
                {syllabusItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Silabus akan diumumkan kemudian.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="text-lg font-bold text-slate-900">Info Acara</h2>
            <dl className="mt-4 space-y-4">
              <InfoItem icon={<CalendarDays className="h-5 w-5" />} label="Tanggal Mulai" value={formatDate(training.startDate)} />
              <InfoItem icon={<Clock className="h-5 w-5" />} label="Durasi" value={training.duration} />
              <InfoItem icon={<MapPin className="h-5 w-5" />} label="Lokasi" value={training.location} />
              <InfoItem icon={<Users className="h-5 w-5" />} label="Sisa Kuota" value={`${training.availableSeats} dari ${training.quota} kursi`} />
            </dl>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-slate-900">Form Pendaftaran</h2>
            {isFull ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
                <Users className="mx-auto h-8 w-8 text-rose-500" />
                <p className="mt-2 text-sm font-semibold text-rose-700">Kuota Pelatihan Penuh</p>
                <p className="mt-1 text-xs text-rose-600">
                  Pendaftaran untuk pelatihan ini sudah ditutup karena kuota terpenuhi.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
                <Field
                  label="Nama Lengkap"
                  icon={<User className="h-4 w-4" />}
                  error={formErrors.employeeName}
                >
                  <input
                    type="text"
                    value={form.employeeName}
                    onChange={handleChange('employeeName')}
                    placeholder="Nama lengkap sesuai KTP"
                    className={inputClass(!!formErrors.employeeName)}
                  />
                </Field>

                <Field label="NIP Karyawan" icon={<Award className="h-4 w-4" />} error={formErrors.nip}>
                  <input
                    type="text"
                    value={form.nip}
                    onChange={handleChange('nip')}
                    placeholder="Contoh: 12345678"
                    className={inputClass(!!formErrors.nip)}
                  />
                </Field>

                <Field label="Departemen" icon={<BriefcaseIcon />} error={formErrors.department}>
                  <select
                    value={form.department}
                    onChange={handleChange('department')}
                    className={inputClass(!!formErrors.department)}
                    disabled={!sessionLoaded}
                  >
                    <option value="">Pilih Departemen</option>
                    {DEPARTMENTS.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Email Pertamina" icon={<Mail className="h-4 w-4" />} error={formErrors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder="nama@pertamina.com"
                    className={inputClass(!!formErrors.email)}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengirim Pendaftaran...
                    </>
                  ) : (
                    'Daftar Sekarang'
                  )}
                </button>
              </form>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}

function inputClass(hasError: boolean): string {
  return `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
    hasError
      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
      : 'border-slate-300 focus:border-sky-500 focus:ring-sky-200'
  }`;
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
        <span className="text-sky-600">{icon}</span>
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
        {icon}
      </span>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
        <dd className="mt-0.5 text-sm font-semibold text-slate-800">{value}</dd>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">{children}</div>;
}

function BriefcaseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-slate-900">
        <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-4 w-40 rounded bg-slate-700" />
          <div className="mt-6 h-8 w-3/4 rounded bg-slate-700" />
          <div className="mt-3 h-4 w-1/3 rounded bg-slate-700" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl animate-pulse grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="space-y-6 lg:col-span-3">
          <div className="h-48 rounded-2xl bg-white shadow-sm" />
          <div className="h-64 rounded-2xl bg-white shadow-sm" />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <div className="h-56 rounded-2xl bg-white shadow-sm" />
          <div className="h-80 rounded-2xl bg-white shadow-sm" />
        </div>
      </div>
    </main>
  );
}

function DetailError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
          <AlertCircle className="h-7 w-7 text-rose-600" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Gagal Memuat Pelatihan</h2>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/trainings"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    </main>
  );
}