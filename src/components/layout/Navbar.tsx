'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, LayoutDashboard, LogIn, ShieldCheck } from 'lucide-react';
import type { SessionUser } from '@/lib/auth';
import LogoutButton from './LogoutButton';

export default function Navbar() {
  const [session, setSession] = useState<SessionUser | null>(null);

  const loadSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      const payload = await response.json();
      setSession(payload.authenticated ? payload.user : null);
    } catch {
      setSession(null);
    }
  }, []);

  // Sesi navbar berasal dari endpoint server, bukan state turunan saat render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSession();
  }, [loadSession]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#101b2d]/95 text-white backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="PorTC beranda">
          <span className="grid h-9 w-9 place-items-center bg-[#d92d20] font-serif text-xl font-bold text-white transition-transform group-hover:-rotate-3">
            P
          </span>
          <span>
            <span className="block text-sm font-black tracking-[0.16em]">PORTC</span>
            <span className="hidden text-[10px] tracking-[0.08em] text-slate-400 sm:block">
              LEARNING HUB / 2026
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/trainings"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Katalog</span>
          </Link>

          {session ? (
            <>
              <Link
                href={session.role === 'Admin' ? '/admin/dashboard' : '/dashboard'}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white"
              >
                {session.role === 'Admin' ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <LayoutDashboard className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <span className="mx-2 hidden h-5 w-px bg-white/20 md:block" />
              <div className="hidden text-right leading-tight md:block">
                <p className="max-w-44 truncate text-xs font-bold">{session.fullName}</p>
                <p className="text-[10px] text-slate-400">{session.nip}</p>
              </div>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="ml-2 inline-flex items-center gap-2 bg-white px-4 py-2 text-sm font-black text-[#101b2d] hover:bg-[#f4f1e9]"
            >
              <LogIn className="h-4 w-4" />
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
