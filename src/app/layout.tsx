import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'PorTC - Pertamina Training & Consulting',
  description: 'Portal pelatihan enterprise Pertamina Training & Consulting.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50">
        <Navbar />
        {children}
      </body>
    </html>
  );
}