'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, GraduationCap, LayoutDashboard, LogIn, ShieldCheck, User } from 'lucide-react';
import LogoutButton from './LogoutButton';

interface SessionUser {
  name: string;
  email: string;
  department: string;
  nip: string;
  role: 'admin' | 'user';
}

export default function Navbar() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = await response.json();
      if (data.authenticated && data.user) {
        setSession(data.user);
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-700">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">PorTC</p>
            <p className="text-[11px] text-slate-400">Pertamina Training & Consulting</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/trainings"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Katalog Pelatihan</span>
          </Link>

          {!loading && session ? (
            <>
              {session.role === 'admin' ? (
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard Admin</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard Saya</span>
                </Link>
              )}

              <div className="ml-1 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 py-1.5 pl-2 pr-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-700">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden leading-tight md:block">
                  <p className="text-xs font-semibold text-white">{session.name}</p>
                  <p className="text-[10px] text-slate-400">{session.email}</p>
                </div>
                <LogoutButton />
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}