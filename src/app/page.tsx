import Link from 'next/link';
import { ArrowRight, Award, Building2, GraduationCap, ShieldCheck, Users } from 'lucide-react';

const highlights = [
  { title: 'Program terkurasi', text: 'Pelatihan operasional, kepemimpinan, HSE, dan digital dalam satu katalog.', icon: GraduationCap },
  { title: 'Profil karyawan terpadu', text: 'Nama, NIP, email, dan departemen otomatis digunakan saat mendaftar.', icon: Users },
  { title: 'Proses transparan', text: 'Status pendaftaran dapat dipantau dan dikelola dari dashboard.', icon: ShieldCheck },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-slate-900 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-400">Pertamina Training & Consulting</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">Portal pelatihan untuk kompetensi yang terus berkembang.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Temukan program, lihat jadwal dan ketersediaan kursi, lalu daftarkan diri menggunakan profil karyawan yang sudah terverifikasi.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/trainings" className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">Lihat Katalog <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/register" className="rounded-lg border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-sky-500 hover:text-white">Buat Akun</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-7 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3 border-b border-slate-700 pb-5"><Building2 className="h-6 w-6 text-sky-400" /><div><p className="font-semibold">PorTC Learning Hub</p><p className="text-xs text-slate-400">Sistem pelatihan enterprise</p></div></div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[['Live', 'Data katalog'], ['Aman', 'Session server'], ['Cepat', 'Daftar online'], ['Terpadu', 'User & admin']].map(([value, label]) => <div key={label} className="rounded-xl bg-slate-900/70 p-4"><p className="text-lg font-bold text-sky-400">{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div>)}
            </div>
            <p className="mt-6 flex gap-2 text-xs leading-5 text-slate-400"><Award className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> Data pelatihan dan pendaftaran berasal langsung dari API .NET dan database Supabase.</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wider text-sky-600">Satu alur yang jelas</p><h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Belajar tanpa proses yang berbelit.</h2></div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {highlights.map(({ title, text, icon: Icon }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-600"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
          </div>
        </div>
      </section>
    </main>
  );
}
