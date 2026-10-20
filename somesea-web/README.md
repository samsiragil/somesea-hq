# Somesea HQ

Ruang kerja personal Sams · **@somesea__** · target omzet **Rp5 juta/bulan**.

Next.js App Router · TypeScript · Tailwind CSS 4 · Supabase Auth & PostgreSQL · Vercel.

## Mulai

```sh
npm ci
```

Jalankan migrasi `supabase/migrations/202610200001_workspace.sql` di proyek Supabase tujuan. Salin `.env.example` menjadi `.env.local`, isi URL proyek dan publishable key, lalu:

```sh
npm run dev
```

Tanpa koneksi Supabase, halaman masuk menampilkan status konfigurasi. Tidak ada data bisnis contoh, mode akun palsu, atau penyimpanan browser pengganti database.

- [Setup, Auth, keamanan dan deploy](docs/SETUP.md)
- [Migrasi JSON lama](docs/MIGRATION.md)
- [Audit awal](docs/AUDIT.md)
- [Hasil pemeriksaan](docs/VERIFICATION.md)
- [README aplikasi statis sebelumnya](docs/LEGACY-README.md)

## Fitur

- Overview target bulanan, pipeline, tindak lanjut jatuh tempo, dan checklist fokus.
- CRM CRUD, pencarian nama/kebutuhan/tindakan, delapan tahap, filter jatuh tempo.
- Roadmap 90 hari dengan delapan fase usulan, tanggal mulai, dan checklist tersimpan.
- Ledger CRUD dengan omzet, kas masuk, biaya, dan arus kas bersih terpisah.
- Pustaka 18 dokumen asli: pencarian isi, tautan internal, pembacaan Markdown, unduh.
- Keputusan CRUD: FINAL, USULAN, EKSPERIMEN, BELUM TERVERIFIKASI, sumber wajib. Tujuh fondasi terkonfirmasi tetap baca-saja.
- Inventaris CRUD dan referensi status aset. Business OS lama tetap BELUM TERVERIFIKASI.
- Ekspor JSON v2 dan impor v1/v2, validasi server, pratinjau konflik, gabung atau ganti, dan konfirmasi eksplisit.

Snapshot pemilik disimpan atomik sebagai JSONB di PostgreSQL. RLS dan server Auth memeriksa pemilik. Revision compare-and-swap mencegah overwrite lintas perangkat. Muat ulang mengambil data terbaru; realtime push dan backup terjadwal belum dibuat.

## Pemeriksaan

```sh
npm run verify:documents
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser suite memakai fixture UI terisolasi tanpa backend di port 4173 serta aplikasi Next.js produksi tanpa konfigurasi di 4174. Fixture bukan bukti koneksi Supabase. Untuk uji provider sebenarnya, gunakan dua akun staging terpisah dan set `RUN_LIVE_AUTH_TESTS=1`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_TEST_EMAIL_A/B`, serta `SUPABASE_TEST_PASSWORD_A/B` melalui environment aman. Tes live tidak menulis data bisnis. Jangan simpan password pengujian di repository.

## Sumber dipertahankan

`dist/` dan `../Somesea-HQ-Interaktif.html` adalah referensi aplikasi lama, bukan target build Next.js. Seluruh dokumen berada di `../Somesea-HQ`; salinan untuk pustaka ada di `src/content/documents.json`, diperiksa SHA-256 terhadap sumber. Sumber awal di Documents/Codex tidak dihapus atau diubah. Aset lama yang belum tersedia tidak dianggap dipulihkan.

## Deployment

Pilih root `somesea-web` dan framework Next.js pada Vercel, atur dua environment Supabase, lalu deploy. Tidak perlu service-role key. Status deploy harus dilihat pada laporan verifikasi; URL yang belum dibuka dan diuji tidak boleh disebut live.
