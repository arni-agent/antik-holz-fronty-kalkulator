import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap'
});

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-playfair'
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
      <body className={`${inter.className} ${playfair.variable}`}>{children}</body>
    </html>
  );
}
