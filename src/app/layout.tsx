import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PorTC Learning Hub',
    template: '%s · PorTC',
  },
  description: 'Portal katalog dan pendaftaran pelatihan Pertamina Training & Consulting.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
