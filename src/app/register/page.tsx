'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Briefcase,
  Eye,
  EyeOff,
  Flame,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { DEPARTMENTS } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    nip: '',
    department: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.name.trim() || form.name.trim().length < 3) {
      setError('Nama lengkap minimal 3 karakter.');
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@pertamina\.com$/.test(form.email.trim())) {
      setError('Gunakan email Pertamina (@pertamina.com).');
      return;
    }

    if (!/^\d{6,20}$/.test(form.nip.trim())) {
      setError('NIP harus berupa angka 6–20 digit.');
      return;
    }

    if (!form.department) {
      setError('Silakan pilih departemen.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          nip: form.nip.trim(),
          department: form.department,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registrasi gagal. Coba lagi.');
        return;
      }

      router.replace('/login?registered=1');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-900 px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-sky-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Login
        </Link>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-8 shadow-xl backdrop-blur">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 shadow-lg shadow-sky-500/20">
              <Flame className="h-7 w-7 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">Registrasi Akun</h1>
            <p className="mt-1 text-sm text-slate-400">
              Daftar untuk mengakses portal pelatihan
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <User className="h-4 w-4 text-sky-400" />
                Nama Lengkap
              </label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Nama lengkap sesuai KTP"
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <Mail className="h-4 w-4 text-sky-400" />
                Email Pertamina
              </label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="nama@pertamina.com"
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <Award className="h-4 w-4 text-sky-400" />
                NIP Karyawan
              </label>
              <input
                type="text"
                value={form.nip}
                onChange={handleChange('nip')}
                placeholder="Contoh: 12345678"
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <Briefcase className="h-4 w-4 text-sky-400" />
                Departemen
              </label>
              <select
                value={form.department}
                onChange={handleChange('department')}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              >
                <option value="">Pilih Departemen</option>
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <Lock className="h-4 w-4 text-sky-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Minimal 8 karakter"
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

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <Lock className="h-4 w-4 text-sky-400" />
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  placeholder="Ulangi password"
                  required
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3.5 py-2.5 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
                  aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  Mendaftarkan...
                </>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-sky-400 transition hover:text-sky-300">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}