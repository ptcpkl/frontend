import Link from 'next/link';
import { ArrowRight, BarChart3, HardHat, Network, ShieldCheck } from 'lucide-react';

const pillars = [
  {
    code: '01 / FIELD',
    title: 'Operational excellence',
    text: 'Program teknis yang dekat dengan situasi lapangan, prosedur, dan standar kerja nyata.',
    icon: HardHat,
  },
  {
    code: '02 / LEAD',
    title: 'People leadership',
    text: 'Bekal memimpin tim, mengambil keputusan, dan membangun budaya kerja berdaya tahan.',
    icon: Network,
  },
  {
    code: '03 / DIGITAL',
    title: 'Data & technology',
    text: 'Keterampilan digital yang langsung dapat dipakai untuk membaca data dan mempercepat proses.',
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="grid-paper border-b border-[#101b2d]/15">
        <div className="mx-auto grid min-h-[650px] max-w-[1440px] lg:grid-cols-[1fr_420px]">
          <div className="flex flex-col justify-between border-[#101b2d]/15 px-5 py-14 sm:px-10 lg:border-r lg:px-16 lg:py-20">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#d92d20]" />
              <p className="technical-label text-[#d92d20]">Pertamina Training & Consulting</p>
            </div>

            <div className="max-w-4xl py-14">
              <h1 className="display-type text-[clamp(3.6rem,9vw,8.8rem)] leading-[0.82] text-[#101b2d]">
                Belajar untuk
                <span className="block italic text-[#d92d20]">medan nyata.</span>
              </h1>
              <p className="mt-9 max-w-2xl border-l-2 border-[#101b2d] pl-5 text-base leading-7 text-slate-700 sm:text-lg">
                Satu ruang untuk menemukan pelatihan, mengamankan kursi, dan mengikuti perjalanan
                pengembangan kompetensi—tanpa formulir yang tercecer.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/trainings"
                className="inline-flex items-center gap-3 bg-[#101b2d] px-6 py-4 text-sm font-black text-white hover:bg-[#d92d20]"
              >
                Jelajahi katalog <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-3 border border-[#101b2d] px-6 py-4 text-sm font-black hover:bg-white"
              >
                Buat akun karyawan
              </Link>
            </div>
          </div>

          <aside className="flex flex-col bg-[#101b2d] p-8 text-white sm:p-12 lg:p-10">
            <div className="flex items-center justify-between border-b border-white/20 pb-5">
              <span className="technical-label text-slate-400">System brief</span>
              <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-400" />
            </div>
            <div className="my-auto py-12">
              <p className="display-type text-8xl leading-none text-white">10</p>
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                Program tersedia
              </p>
              <div className="mt-12 grid grid-cols-2 gap-px bg-white/15">
                {[
                  ['04', 'Kategori inti'],
                  ['01', 'Profil terpadu'],
                  ['24/7', 'Akses katalog'],
                  ['LIVE', 'Status kursi'],
                ].map(([value, label]) => (
                  <div key={label} className="bg-[#101b2d] p-5">
                    <p className="font-mono text-2xl font-bold">{value}</p>
                    <p className="mt-1 text-xs text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-white/20 pt-5 text-xs leading-5 text-slate-400">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              Data pendaftaran diproses melalui API terautentikasi dan profil karyawan terverifikasi.
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-[#101b2d]/15 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-10 lg:px-16">
          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <div>
              <p className="technical-label text-[#d92d20]">Capability map</p>
              <h2 className="display-type mt-4 text-5xl leading-[0.95] sm:text-6xl">
                Kompetensi yang bergerak bersama bisnis.
              </h2>
            </div>
            <div className="grid border-l border-t border-[#101b2d]/20 md:grid-cols-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <article key={pillar.code} className="min-h-72 border-b border-r border-[#101b2d]/20 p-7">
                    <div className="flex items-center justify-between">
                      <p className="technical-label text-slate-500">{pillar.code}</p>
                      <Icon className="h-5 w-5 text-[#d92d20]" />
                    </div>
                    <h3 className="mt-16 text-xl font-black">{pillar.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{pillar.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#d92d20] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-14 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-16">
          <div>
            <p className="technical-label text-white/70">Next intake</p>
            <h2 className="display-type mt-2 text-4xl sm:text-5xl">Temukan kursi Anda.</h2>
          </div>
          <Link
            href="/trainings"
            className="inline-flex w-fit items-center gap-3 bg-white px-6 py-4 text-sm font-black text-[#101b2d] hover:bg-[#101b2d] hover:text-white"
          >
            Buka katalog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
