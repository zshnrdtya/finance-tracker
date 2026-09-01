import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FinanceTrack - Pelacak Keuangan Pribadi & Keluarga',
  description:
    'Aplikasi web pelacak keuangan pribadi dan keluarga modern untuk mencatat pemasukan, pengeluaran, dan visualisasi laporan keuangan.',
  icons: {
    icon: [
      { url: '/asset/logo zz.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/asset/logo zz.png',
    apple: '/asset/logo zz.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-gray-50 text-gray-900 antialiased flex flex-col selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
