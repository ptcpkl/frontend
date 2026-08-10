import Link from 'next/link';
import { Flame, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_0.7fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-700">
              <Flame className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="font-bold text-white">PorTC Learning Hub</p>
              <p className="text-xs text-slate-400">Pertamina Training & Consulting</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            Portal terpadu untuk menemukan program, mendaftar pelatihan, dan memantau proses persetujuan karyawan.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Navigasi</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-sky-400">Beranda</Link>
            <Link href="/trainings" className="hover:text-sky-400">Katalog Pelatihan</Link>
            <Link href="/dashboard" className="hover:text-sky-400">Dashboard Saya</Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Kontak</p>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" /> Jakarta, Indonesia</p>
            <p className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" /> learning@pertamina-ptc.com</p>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Pertamina Training & Consulting. Portal internal pelatihan.
      </div>
    </footer>
  );
}
