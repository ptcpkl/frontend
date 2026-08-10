'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.errors?.[0] ?? payload.message ?? 'Email atau password tidak sesuai.');
        return;
      }

      const requested = params.get('from');
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
    <form onSubmit={submit} className="mt-9 space-y-5">
      {error && (
        <div className="flex gap-3 border border-[#d92d20] bg-red-50 p-4 text-sm text-[#b42318]">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}
      <label className="block">
        <span className="technical-label text-slate-500">Email perusahaan</span>
        <span className="relative mt-2 block">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@pertamina.com" className="h-13 w-full border border-[#101b2d]/30 bg-white py-3.5 pl-11 pr-4 outline-none focus:border-[#d92d20]" />
        </span>
      </label>
      <label className="block">
        <span className="technical-label text-slate-500">Password</span>
        <span className="relative mt-2 block">
          <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-[#101b2d]/30 bg-white py-3.5 pl-11 pr-12 outline-none focus:border-[#d92d20]" />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </span>
      </label>
      <button disabled={loading} className="flex w-full items-center justify-center gap-3 bg-[#101b2d] px-5 py-4 text-sm font-black text-white hover:bg-[#d92d20] disabled:opacity-60">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        {loading ? 'Memeriksa akun…' : 'Masuk ke workspace'}
      </button>
      <p className="text-center text-sm text-slate-600">
        Belum memiliki akun? <Link href="/register" className="font-black text-[#d92d20]">Daftar di sini</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-[calc(100vh-68px)] bg-white lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.72fr)]">
      <section className="grid-paper hidden border-r border-[#101b2d]/20 p-16 lg:flex lg:flex-col lg:justify-between">
        <p className="technical-label text-[#d92d20]">Identity gateway / secure access</p>
        <div>
          <p className="display-type max-w-3xl text-7xl leading-[0.88]">Satu identitas. Seluruh perjalanan belajar.</p>
          <p className="mt-7 max-w-xl border-l-2 border-[#d92d20] pl-5 leading-7 text-slate-600">Profil karyawan menjadi sumber data pendaftaran, sehingga nama, NIP, dan departemen tidak perlu diketik ulang.</p>
        </div>
        <p className="font-mono text-xs text-slate-500">PORTC / AUTHENTICATION SERVICE / 2026</p>
      </section>
      <section className="flex items-center px-5 py-16 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <p className="technical-label text-[#d92d20]">Welcome back</p>
          <h1 className="display-type mt-3 text-5xl">Masuk ke PorTC</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Gunakan akun yang tersimpan pada backend pelatihan.</p>
          <Suspense fallback={<div className="mt-12"><Loader2 className="h-5 w-5 animate-spin" /></div>}><LoginForm /></Suspense>
        </div>
      </section>
    </main>
  );
}
