'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.replace('/login');
        router.refresh();
      }}
      className="ml-2 grid h-9 w-9 place-items-center border border-white/20 text-slate-300 hover:border-[#d92d20] hover:bg-[#d92d20] hover:text-white"
      aria-label="Keluar"
      title="Keluar"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
