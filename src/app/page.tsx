'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Flame, GraduationCap, Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/trainings');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-900 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-3xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 shadow-lg shadow-sky-500/20">
          <Flame className="h-8 w-8 text-white" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-sky-400">
          Pertamina Training & Consulting
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-5xl">
          PorTC Enterprise
          <br />
          Training Portal
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-slate-300 sm:text-base">
          Portal pelatihan enterprise untuk pengembangan kompetensi karyawan Pertamina di seluruh Indonesia.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/trainings"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            <GraduationCap className="h-4 w-4" />
            Katalog Pelatihan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1.5 text-xs text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
          Mengalihkan ke Katalog Pelatihan...
        </div>
      </div>
    </main>
  );
}