'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="fallback">
      <p className="eyebrow">SOMESEA HQ</p>
      <h1>Ruang kerja belum dapat dimuat.</h1>
      <p>
        Periksa koneksi dan pastikan migrasi database sudah dijalankan. Data tersimpan tidak diubah.
      </p>
      <button className="primary" onClick={reset}>
        Coba kembali
      </button>
      <a href="/login">Kembali ke halaman masuk</a>
    </main>
  );
}
