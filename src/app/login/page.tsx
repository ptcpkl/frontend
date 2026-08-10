'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Flame, Loader2, Lock, Mail } from 'lucide-react';
import { validatePertaminaEmail } from '@/lib/validation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const nextErrors: typeof fieldErrors = {};
    const emailError = validatePertaminaEmail(email);
    if (emailError) nextErrors.email = emailError;
    if (!password) nextErrors.password = 'Password wajib diisi.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.errors?.[0] ?? payload.message ?? 'Email atau password tidak sesuai.');
        return;
      }

      const requested = searchParams.get('from');
      const safeRequested = requested?.startsWith('/') && !requested.startsWith('//') ? requested : null;
      router.replace(safeRequested ?? (payload.user.role === 'Admin' ? '/admin/dashboard' : '/dashboard'));
      router.refresh();
    } catch {
      setError('Layanan login belum dapat dijangkau. Coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
      {error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><span>{error}</span></div>}

      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300"><Mail className="h-4 w-4 text-sky-400" /> Email Pertamina</span>
        <input
          type="email"
          value={email}
          onChange={(event) => { setEmail(event.target.value); setFieldErrors((current) => ({ ...current, email: undefined })); }}
          onBlur={() => setFieldErrors((current) => ({ ...current, email: validatePertaminaEmail(email) ?? undefined }))}
          placeholder="nama@pertamina.com"
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby="login-email-error"
          className={`w-full rounded-lg border bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 ${fieldErrors.email ? 'border-rose-500 focus:ring-rose-500/30' : 'border-slate-600 focus:border-sky-500 focus:ring-sky-500/40'}`}
        />
        <span id="login-email-error" className={`mt-1.5 block text-xs ${fieldErrors.email ? 'text-rose-300' : 'text-slate-500'}`}>{fieldErrors.email ?? 'Contoh format benar: nama@pertamina.com'}</span>
      </label>

      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300"><Lock className="h-4 w-4 text-sky-400" /> Password</span>
        <span className="relative block">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: undefined })); }}
            autoComplete="current-password"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby="login-password-error"
            className={`w-full rounded-lg border bg-slate-900 px-3.5 py-2.5 pr-11 text-sm text-white outline-none focus:ring-2 ${fieldErrors.password ? 'border-rose-500 focus:ring-rose-500/30' : 'border-slate-600 focus:border-sky-500 focus:ring-sky-500/40'}`}
          />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
        </span>
        {fieldErrors.password && <span id="login-password-error" className="mt-1.5 block text-xs text-rose-300">{fieldErrors.password}</span>}
      </label>

      <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? 'Memeriksa akun…' : 'Masuk'}</button>
      <p className="text-center text-sm text-slate-400">Belum punya akun? <Link href="/register" className="font-semibold text-sky-400 hover:text-sky-300">Daftar di sini</Link></p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-slate-900 px-4 py-12">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-sky-400"><ArrowLeft className="h-4 w-4" /> Kembali ke Beranda</Link>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-7 shadow-xl backdrop-blur sm:p-8">
          <div className="flex flex-col items-center text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 shadow-lg shadow-sky-500/20"><Flame className="h-7 w-7" /></span><h1 className="mt-4 text-2xl font-bold">Login PorTC</h1><p className="mt-1 text-sm text-slate-400">Masuk untuk mengakses dashboard Anda</p></div>
          <Suspense fallback={<div className="mt-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-sky-400" /></div>}><LoginForm /></Suspense>
        </div>
      </div>
    </main>
  );
}
