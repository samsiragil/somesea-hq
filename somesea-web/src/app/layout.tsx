import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Newsreader, Public_Sans } from 'next/font/google';
import './globals.css';
// Font di-host sendiri oleh Next.js sehingga tetap sesuai CSP font-src 'self'.
const serif = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500'],
  variable: '--font-newsreader',
  display: 'swap',
});
const sans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-public-sans',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});
export const metadata: Metadata = {
  title: 'Somesea HQ · Ruang kerja Sams',
  description: 'Pusat kerja personal @somesea__: relasi, eksekusi, dan angka yang memberi arah.',
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10283A' },
    { media: '(prefers-color-scheme: dark)', color: '#06111A' },
  ],
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">
          Lewati ke konten
        </a>
        {children}
      </body>
    </html>
  );
}
