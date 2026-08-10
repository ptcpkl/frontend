'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', nip: '', department: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Konfirmasi password tidak sama.');
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) return setError('Password minimal 8 karakter serta memuat huruf dan angka.');

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.errors?.[0] ?? payload.message ?? 'Registrasi belum berhasil.');
        return;
      }
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Layanan registrasi belum dapat dijangkau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#f4f1e9]">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-14 sm:px-10 lg:grid-cols-[340px_1fr] lg:py-20">
        <aside>
          <p className="technical-label text-[#d92d20]">New employee profile</p>
          <h1 className="display-type mt-4 text-6xl leading-[0.9]">Mulai dari profil yang akurat.</h1>
          <p className="mt-7 text-sm leading-7 text-slate-600">Data di bawah digunakan sebagai identitas resmi pada setiap pendaftaran pelatihan.</p>
          <ul className="mt-8 space-y-4 border-t border-[#101b2d]/20 pt-6 text-sm font-semibold">
            {['Password disimpan sebagai BCrypt hash', 'Role awal selalu User', 'NIP dan email wajib unik'].map((item) => (
              <li key={item} className="flex gap-3"><Check className="h-4 w-4 text-emerald-600" /> {item}</li>
            ))}
          </ul>
        </aside>

        <section className="bg-white p-6 sm:p-10 lg:p-12">
          <div className="flex items-end justify-between border-b border-[#101b2d]/20 pb-6">
            <div><p className="technical-label text-slate-500">Form 01</p><h2 className="display-type mt-2 text-4xl">Buat akun</h2></div>
            <Link href="/login" className="text-sm font-black text-[#d92d20]">Sudah punya akun?</Link>
          </div>

          {error && <div className="mt-6 flex gap-3 border border-[#d92d20] bg-red-50 p-4 text-sm text-[#b42318]"><AlertCircle className="h-5 w-5 shrink-0" /> {error}</div>}

          <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
            <Field label="Nama lengkap"><input required minLength={3} autoComplete="name" value={form.name} onChange={update('name')} /></Field>
            <Field label="NIP karyawan"><input required pattern="[0-9]{6,20}" inputMode="numeric" value={form.nip} onChange={update('nip')} /></Field>
            <Field label="Email Pertamina" className="sm:col-span-2"><input required type="email" pattern=".+@pertamina\.com" autoComplete="email" placeholder="nama@pertamina.com" value={form.email} onChange={update('email')} /></Field>
            <Field label="Departemen" className="sm:col-span-2"><select required value={form.department} onChange={update('department')}><option value="">Pilih departemen</option>{DEPARTMENTS.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Password"><span className="relative block"><input required type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={update('password')} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" aria-label="Tampilkan password">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></Field>
            <Field label="Konfirmasi password"><input required type="password" autoComplete="new-password" value={form.confirmPassword} onChange={update('confirmPassword')} /></Field>
            <button disabled={loading} className="mt-2 flex items-center justify-center gap-3 bg-[#101b2d] px-5 py-4 text-sm font-black text-white hover:bg-[#d92d20] disabled:opacity-60 sm:col-span-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? 'Membuat akun…' : 'Buat akun dan masuk'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={`block ${className}`}><span className="technical-label text-slate-500">{label}</span><span className="mt-2 block [&_input]:w-full [&_input]:border [&_input]:border-[#101b2d]/30 [&_input]:px-4 [&_input]:py-3.5 [&_input]:outline-none [&_input]:focus:border-[#d92d20] [&_select]:w-full [&_select]:border [&_select]:border-[#101b2d]/30 [&_select]:bg-white [&_select]:px-4 [&_select]:py-3.5 [&_select]:outline-none [&_select]:focus:border-[#d92d20]">{children}</span></label>;
}
