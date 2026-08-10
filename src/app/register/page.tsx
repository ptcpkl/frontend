'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Briefcase, Eye, EyeOff, Flame, Loader2, Lock, Mail, User } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/auth';
import { fieldForServerError, validateNip, validatePertaminaEmail } from '@/lib/validation';

type FormState = { name: string; email: string; nip: string; department: string; password: string; confirmPassword: string };
type FieldName = keyof FormState;
type FieldErrors = Partial<Record<FieldName, string>>;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ name: '', email: '', nip: '', department: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: FieldName) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setGeneralError(null);
  };

  const validate = () => {
    const next: FieldErrors = {};
    if (form.name.trim().length < 3) next.name = 'Nama lengkap minimal 3 karakter.';
    next.email = validatePertaminaEmail(form.email) ?? undefined;
    next.nip = validateNip(form.nip) ?? undefined;
    if (!form.department) next.department = 'Silakan pilih departemen.';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) next.password = 'Password minimal 8 karakter serta memiliki huruf dan angka.';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Konfirmasi password tidak cocok.';
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, name: form.name.trim(), email: form.email.trim().toLowerCase(), nip: form.nip.trim() }),
      });
      const payload = await response.json();
      if (!response.ok) {
        const message = payload.errors?.[0] ?? payload.message ?? 'Registrasi belum berhasil.';
        const field = fieldForServerError(message) as FieldName | null;
        if (field) setErrors((current) => ({ ...current, [field]: message }));
        else setGeneralError(message);
        return;
      }
      router.replace('/dashboard?registered=1');
      router.refresh();
    } catch {
      setGeneralError('Layanan registrasi belum dapat dijangkau. Coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative overflow-hidden bg-slate-900 px-4 py-12 text-white">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="relative mx-auto w-full max-w-3xl">
        <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-sky-400"><ArrowLeft className="h-4 w-4" /> Kembali ke Login</Link>
        <section className="rounded-2xl border border-slate-700 bg-slate-800/85 p-6 shadow-xl backdrop-blur sm:p-9">
          <div className="flex flex-col items-center text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700"><Flame className="h-7 w-7" /></span><h1 className="mt-4 text-2xl font-bold">Registrasi Akun</h1><p className="mt-1 text-sm text-slate-400">Gunakan identitas karyawan Pertamina yang benar</p></div>
          {generalError && <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200"><AlertCircle className="h-5 w-5 shrink-0" />{generalError}</div>}

          <form onSubmit={submit} noValidate className="mt-7 grid gap-5 sm:grid-cols-2">
            <Field label="Nama lengkap" icon={<User className="h-4 w-4" />} error={errors.name} className="sm:col-span-2"><input value={form.name} onChange={update('name')} autoComplete="name" placeholder="Nama lengkap sesuai data karyawan" /></Field>
            <Field label="NIP karyawan" icon={<User className="h-4 w-4" />} error={errors.nip} hint="6-20 digit angka. Contoh: 12345678."><input value={form.nip} onChange={update('nip')} onBlur={() => setErrors((current) => ({ ...current, nip: validateNip(form.nip) ?? undefined }))} inputMode="numeric" placeholder="12345678" /></Field>
            <Field label="Email Pertamina" icon={<Mail className="h-4 w-4" />} error={errors.email} hint="Contoh format benar: nama@pertamina.com"><input type="email" value={form.email} onChange={update('email')} onBlur={() => setErrors((current) => ({ ...current, email: validatePertaminaEmail(form.email) ?? undefined }))} autoComplete="email" placeholder="nama@pertamina.com" /></Field>
            <Field label="Departemen" icon={<Briefcase className="h-4 w-4" />} error={errors.department} className="sm:col-span-2"><select value={form.department} onChange={update('department')}><option value="">Pilih departemen</option>{DEPARTMENTS.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Password" icon={<Lock className="h-4 w-4" />} error={errors.password} hint="Minimal 8 karakter, memiliki huruf dan angka."><span className="relative block"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} autoComplete="new-password" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></Field>
            <Field label="Konfirmasi password" icon={<Lock className="h-4 w-4" />} error={errors.confirmPassword}><input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={update('confirmPassword')} autoComplete="new-password" /></Field>
            <button type="submit" disabled={loading} className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 sm:col-span-2">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? 'Membuat akun…' : 'Buat akun dan masuk'}</button>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({ label, icon, error, hint, className = '', children }: { label: string; icon: React.ReactNode; error?: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300"><span className="text-sky-400">{icon}</span>{label}</span>
      <span className={`block [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:bg-slate-900 [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-sm [&_input]:text-white [&_input]:outline-none [&_input]:placeholder:text-slate-500 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:bg-slate-900 [&_select]:px-3.5 [&_select]:py-2.5 [&_select]:text-sm [&_select]:text-white [&_select]:outline-none ${error ? '[&_input]:border-rose-500 [&_select]:border-rose-500' : '[&_input]:border-slate-600 [&_input]:focus:border-sky-500 [&_select]:border-slate-600 [&_select]:focus:border-sky-500'}`}>{children}</span>
      {(error || hint) && <span className={`mt-1.5 block text-xs ${error ? 'text-rose-300' : 'text-slate-500'}`}>{error ?? hint}</span>}
    </label>
  );
}
