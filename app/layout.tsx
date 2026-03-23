import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Kalkulator frontów | ANTIK-HOLZ Profis',
  description:
    'Premium kalkulator cen frontów meblowych ze starego drewna dla ANTIK-HOLZ Profis. Natychmiastowa estymacja netto i brutto.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
