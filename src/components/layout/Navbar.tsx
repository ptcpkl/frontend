'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Flame,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  Menu,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import type { SessionUser } from '@/lib/auth';
import LogoutButton from './LogoutButton';

export default function Navbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = await response.json();
      setSession(data.authenticated && data.user ? data.user : null);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Navbar menyinkronkan session server setiap route berubah.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSession();
  }, [fetchSession, pathname]);

  const dashboardHref = session?.role === 'Admin' ? '/admin/dashboard' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900 text-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="PorTC beranda">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-700">
            <Flame className="h-5 w-5 text-white" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-white">PorTC</span>
            <span className="hidden text-[11px] text-slate-400 sm:block">Pertamina Training & Consulting</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/trainings" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white">
            <GraduationCap className="h-4 w-4" /> Katalog Pelatihan
          </Link>
          {!loading && session ? (
            <>
              <Link href={dashboardHref} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white">
                {session.role === 'Admin' ? <ShieldCheck className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                {session.role === 'Admin' ? 'Dashboard Admin' : 'Dashboard Saya'}
              </Link>
              <div className="ml-2 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/70 py-1.5 pl-2 pr-1.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600"><User className="h-4 w-4" /></span>
                <span className="max-w-40 leading-tight">
                  <span className="block truncate text-xs font-semibold">{session.fullName}</span>
                  <span className="block truncate text-[10px] text-slate-400">{session.nip} · {session.role}</span>
                </span>
                <LogoutButton />
              </div>
            </>
          ) : !loading ? (
            <div className="ml-2 flex items-center gap-2">
              <Link href="/register" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">Daftar</Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"><LogIn className="h-4 w-4" /> Login</Link>
            </div>
          ) : null}
        </nav>

        <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 md:hidden" aria-label="Buka menu navigasi">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="space-y-2 border-t border-slate-800 px-4 py-4 md:hidden">
          <Link href="/trainings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"><GraduationCap className="h-4 w-4" /> Katalog Pelatihan</Link>
          {session ? (
            <>
              <Link href={dashboardHref} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
              <div className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2">
                <div><p className="text-sm font-semibold">{session.fullName}</p><p className="text-xs text-slate-400">{session.email}</p></div>
                <LogoutButton />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2"><Link href="/register" className="rounded-lg border border-slate-700 px-3 py-2 text-center text-sm">Daftar</Link><Link href="/login" className="rounded-lg bg-sky-600 px-3 py-2 text-center text-sm font-semibold">Login</Link></div>
          )}
        </nav>
      )}
    </header>
  );
}
