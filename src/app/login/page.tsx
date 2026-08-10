'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Flame, Loader2, Lock, Mail } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '';
  const registered = searchParams.get('registered') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login gagal. Periksa kembali kredensial Anda.');
        return;
      }

      // Redirect based on role
      const redirectTo =
        from ||
        (data.role === 'admin' ? '/admin/dashboard' : '/dashboard');

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {registered && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <span>Registrasi berhasil! Silakan login dengan akun Anda.</span>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
            <Mail className="h-4 w-4 text-sky-400" />
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@pertamina.com"
            required
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
            <Lock className="h-4 w-4 text-sky-400" />
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3.5 py-2.5 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            'Masuk'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Belum punya akun?{' '}
        <Link href="/register" className="font-semibold text-sky-400 transition hover:text-sky-300">
          Daftar di sini
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-900 px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-sky-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-8 shadow-xl backdrop-blur">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 shadow-lg shadow-sky-500/20">
              <Flame className="h-7 w-7 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">Login PorTC</h1>
            <p className="mt-1 text-sm text-slate-400">
              Masuk untuk mengakses dashboard Anda
            </p>
          </div>

          <Suspense
            fallback={
              <div className="mt-6 flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat form login...
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          <div className="mt-6 space-y-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <p className="text-center text-xs font-medium uppercase tracking-wide text-slate-500">
              Kredensial Demo
            </p>
            <div className="rounded-lg bg-slate-800/60 p-3">
              <p className="text-xs font-semibold text-sky-400">👤 Karyawan</p>
              <p className="mt-1 text-sm text-slate-300">
                Email: <span className="font-mono text-sky-400">berq@pertamina.com</span>
              </p>
              <p className="text-sm text-slate-300">
                Password: <span className="font-mono text-sky-400">berkeganteng123</span>
              </p>
            </div>
            <div className="rounded-lg bg-slate-800/60 p-3">
              <p className="text-xs font-semibold text-sky-400">🛡️ Admin</p>
              <p className="mt-1 text-sm text-slate-300">
                Email: <span className="font-mono text-sky-400">admin@ptc.com</span>
              </p>
              <p className="text-sm text-slate-300">
                Password: <span className="font-mono text-sky-400">admin321</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}