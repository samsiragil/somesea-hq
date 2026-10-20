# Somesea HQ

Pusat kerja personal Sams · @somesea__ · target omzet Rp5 juta/bulan.

## Struktur

- `somesea-web/`: aplikasi Next.js App Router, TypeScript, Tailwind CSS dan Supabase.
- `Somesea-HQ/`: 18 dokumen bisnis sumber yang dipertahankan utuh.
- `Somesea-HQ-Interaktif.html`: referensi aplikasi statis awal.

Lihat [panduan aplikasi](somesea-web/README.md), [setup Supabase/Vercel](somesea-web/docs/SETUP.md), [migrasi JSON](somesea-web/docs/MIGRATION.md), dan [laporan verifikasi](somesea-web/docs/VERIFICATION.md).

## Menjalankan

```sh
cd somesea-web
npm ci
```

Isi `.env.local` dari `.env.example`, jalankan migrasi database, lalu `npm run dev`.

Vercel **Root Directory: `somesea-web`**, Framework: Next.js. Environment hanya membutuhkan URL Supabase dan publishable key. Service-role key tidak dipakai aplikasi.

Tidak ada data bisnis contoh sebagai data aktual. Aset Business OS lama tetap belum terverifikasi.
