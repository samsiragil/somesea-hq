import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Somesea HQ · Ruang kerja Sams',
  description: 'Pusat kerja personal @somesea__: relasi, eksekusi, dan angka yang memberi arah.',
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <a className="skip" href="#main">
          Lewati ke konten
        </a>
        {children}
      </body>
    </html>
  );
}
