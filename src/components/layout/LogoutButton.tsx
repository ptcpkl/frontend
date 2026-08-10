'use client';

import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      // Force full page reload to clear all client state and re-fetch session
      window.location.href = '/login';
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900/60 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
      title="Logout"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}